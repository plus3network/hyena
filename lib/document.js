var _ = require('lodash');
var util = require('util');
var Hooks = require('./hooks');
var events = require('events');
var mpath = require('mpath');
var PathStates = require('./path_states');
var inflection = require('inflection');
var Collection = require('./collection');
var typeCasting = require('./typeCasting');

var handleError = function (err) {
	if (this.constructor.listeners('error').length) {
		this.emit(err);
	} else {
		if (!this.db.listeners('error').length) {
			err.stack = 'No listeners detected, throwing. '
								+ 'Consider adding an error listener to your connection.\n'
								+ err.stack;
		}
		this.db.emit('error', err);
	}
};

var buildGetter = function (key, def, model) {
  return function () {
    var filter = function (v) { return v; };
    if(def && def.get && 'function' === typeof(def.get)) {
      filter = def.get.bind(this);
    }
    return filter(this.attributes[key]);
  };
};

var buildSetter = function (key, def, model) { 
  return function (value) { 
    var self = this;
    var filter = function (v) { return v; };
    if(def && def.set && 'function' === typeof(def.set)) {
      filter = def.set.bind(this);
    }
    // if the key is a model type and the value is an instance of that model
    // then we need to set the value of the join field.
    if (model && value instanceof model) {
      // set the join field if the value is a model 
      // if the id hasen't been set yet we need to set it once the document
      // has been created.
      if (value.isNew) {
        value.on('save', function (doc) {
          self.attributes[def.field] = doc.id;
          self.pathStates.modify(def.field);
        });
      } else {
        this.attributes[def.field] = value.id;
        this.pathStates.modify(def.field);
      }

    }
    this.attributes[key] = filter(value);
    this.pathStates.modify(key);
  };

};

var buildGetterAndSetters = function () {
	var self = this;
	var schema = this.constructor.schema;
	var keys = _.union(schema.fields(), _.keys(schema.models()));
  this.pathStates = new PathStates(keys);
  // set defaults
	keys.forEach(function (key) {
		var def = schema.paths[key];
    
    // For a many to many we need to override the getter
    if (def && def.type === 'join' && def.schema.through) {
      // Initalize with an empty collection
      self.attributes[key] = new Collection(key, def, self, []);
      def.set = function (v) {
        return new Collection(key, def, this, v); 
      };
    }

		var model = def && def.type && self.db.model(def.type) || null;
    var getter = buildGetter(key, def, model).bind(self);
    var setter = buildSetter(key, def, model).bind(self);
    // Define the feilds with the getter setter
    // TODO: this should probably be the actual definition instead of a new object.
    self.fields[key] = { get: getter, set: setter };
    // define the getters and setters
		Object.defineProperty(self, key, self.fields[key]);
	});

  _.forIn(schema.virtuals, function (value, path) {
    var getter = value.get && value.get.bind(this) || null;
    var setter = value.set && value.set.bind(this) || null;
    this.virtuals[path] = { get: getter, set: setter };
    Object.defineProperty(this, path, this.virtuals[path]);
  }, this);

};

var Document = function Document (doc, table, constructor, db) {
	doc = doc || {};

	this.table = table;
	this.db = db;
	this.constructor = constructor;
	this.pres = constructor.schema.pres;
	this.posts = constructor.schema.posts;
  this.selected = {};
  this.pathStates = null;
  this.isNew = true;
  this.fields = {};
  this.virtuals = {};

	events.EventEmitter.call(this);

	var self = this;
	this.runPre('init', [this], function (err) {
		if (err)  return handleError.call(self, err);
		self.id = doc.id ? doc.id : null;
		self.isNew = self.id ? false : true;
		self.attributes = {};
		buildGetterAndSetters.call(self);
		self.hydrate(doc);
		self.emit('init', doc);
		self.runPost('init', [self], function (err) {
			if (err) handleError.call(self, err);
		});

	});

};

util.inherits(Document, events.EventEmitter);
_.extend(Document.prototype, Hooks.prototype);

Document.prototype.populate = function (path, callback) {
  this.constructor.populate(this, path, callback);
};

Document.prototype.get = function (path, type) {
  var value = mpath.get(path, this);
  // Not sure if we need to support models or not.
  if (type === String || type === Number || type === Boolean) {
    value = type(value);
  }
  return value;
};

Document.prototype.set = function (path, value, type, options) {
  var self = this;
  var schema = this.constructor.schema;
  var schemaType = this.constructor.getType(path);

  if (type && type.constructor.name == 'Object') {
    options = type;
    type = undefined;
  }

  if ('string' !== typeof(path)) {
    _.forIn(path, function (value, key) {
      self.set(key, value);
    });
    return;
  }

  if (schema.options.primaryKey && path === schema.options.primaryKey) {
    return;
  }

  if (!this.constructor.validatePath(path)) {
    throw new Error('Field '+path+' is not in the schema');
  }


  // Not sure if we need to support models or not.
  if (type === String || type === Number || type === Boolean) {
    value = type(value);
  } else if (schemaType && schemaType.type !== 'join') {
    value = typeCasting(value, schemaType, this.db);
  } else if (schemaType && schemaType === 'join') {
    return;
  }
  mpath.set(path, value, this); 

  return value;
};

Document.prototype.hydrate = function (doc) {
	var model = this.constructor.schema.validate(doc);
  var data = _.defaults(doc, model.data);
	var self = this;
	var keys = Object.keys(data);
	keys.forEach(function (key) {
    self[key] = data[key];
		// self.set(key, data[key]);
    if(key !== 'id') self.pathStates.reset(key);
	});
};

Document.prototype.validate = function (callback) {
	var self = this;
	this.runPre('validate', [this], function (err) {
		if (err) return callback(err);
		var data = self.constructor.schema.validate(self.attributes);
		self.isValid = data.valid;
		self.errors = data.errors;
		if (!self.isValid) {
			var error = new Error('Validation Error');
			error.errors = self.errors;
			return callback(error);
		}
		self.runPost('validate', [self], callback);
	});
};

var buildStateGetter = function (state) {
  state = 'is'+inflection.capitalize(state);
  return function (path) {
    if(/\./.test(path) && this.constructor.validatePath(path)) {
      var parts = path.split('.');
      path = parts[0];
      var newPath = _.last(parts, parts.length-1).join('.');
      var subdoc = this.get(path);
      if (subdoc instanceof Document) {
        return subdoc[state](newPath);
      }
    }
    return this.pathStates[state](path);
  };
};

Document.prototype.isModified = buildStateGetter('modified');
Document.prototype.isInit = buildStateGetter('init');

Document.prototype.isSelected = function (path) {
    if(/\./.test(path) && this.constructor.validatePath(path)) {
      var parts = path.split('.');
      path = parts[0];
      var newPath = _.last(parts, parts.length-1).join('.');
      var subdoc = this.get(path);
      if (subdoc instanceof Document) {
        return subdoc.isSelected(newPath);
      }
    }
  if (this.selected[path] != null) {
    return this.selected[path];
  }
};

Document.prototype.markModified = function (path) {
   if(/\./.test(path) && this.constructor.validatePath(path)) {
    var parts = path.split('.');
    path = parts[0];
    var newPath = _.last(parts, parts.length-1).join('.');
    var subdoc = this.get(path);
    if (subdoc instanceof Document) {
      return subdoc.markModified(newPath);
    }
  }
  return this.pathStates.modify(path);
};

Document.prototype.isDirectModified = function (path) {
  return !!~this.modifiedPaths().indexOf(path);
};

Document.prototype.modifiedPaths = function () {
  var self = this;
  var paths = [];
  var models = Object.keys(this.constructor.schema.models());
  models.forEach(function (path) {
    var p;
    var subdoc = self.get(path);
    if (subdoc && subdoc instanceof Document) {
      p = subdoc.modifiedPaths();
      paths = _(p)
        .map(function (key) { return path+'.'+key; })
        .union(paths)
        .value();
    }
  });
  this.pathStates.each(function (path, state) {
    if ('modified' === state) {
      paths.push(path);
    }
  });
  return paths;
};

Document.prototype.save = function (callback) {
	var self = this;
  callback = callback || function () { };

	this.validate(function (err) {
		if (err) return callback(err);

		var query = new self.db.Query(self.constructor);

		// Run the middleware
		self.runPre('save', [self], function (err) {
			// Handle any middleware errors
			if (err) {
				handleError.call(self, err);
        console.log(err);
				return callback(err);
			}

      // Filter out all the documents
      var data = _.omit(self.attributes, function (value) {
        return value instanceof Document;
      });

      // Set the id of the document
      data.id = self.id;

			// Run the upsert
			query.upsert(data).exec(function (err, results) {
				// handle any errors from the query
				if (err) {
					handleError.call(self, err);
					return callback(err);
				}
				// If it's a new object then we need to set the id and change the 
				// is new attribute to false
				if (self.isNew) {
					self.id = results.insertId;
					self.isNew = false;
				}
				// Run the post middleware
				self.runPost('save', [self], function (err) {
					if (err) {
						handleError.call(self, err);
						return callback(err);
					}
					// Emit the save event
					self.emit('save', self);
					// call the callback
					callback(null, self);
				});
			});

		});

	});

};

Document.prototype.remove = function (callback) {
  var self = this;
  var query = new this.db.Query(this.constructor);
  
  this.runPre('remove', [this], function (err) {
    if (err) {
      handleError.call(self, err);
      return callback(err);
    }
    query.delete();
    if (self.constructor.schema.options.primaryKey) {
      query
        .where(self.constructor.schema.options.primaryKey) 
        .equals(self[self.constructor.schema.options.primaryKey]);
    } else {
      Object.keys(self.attributes).forEach(function (key) {
        query.where(key).equals(self.attributes[key]); 
      });
    }
    query.exec(function (err, info) {
      if (err) {
        handleError.call(self, err);
        return callback(err);
      }
      self.runPost('remove', [self], function (err) {
        if (err) {
          handleError.call(self, err);
          return callback(err);
        }
        self.emit('remove', self); 
        callback(null, self);
      });
    });
  });
};

var applyGetters = function (self, json, fields) {
  fields.forEach(function (path) {
    json[path] = _.cloneDeep(self.get(path));
  });
  return json;
};

Document.prototype.toObject = function (options) {
  options = _.defaults(options || {}, this.constructor.schema.options.toObject || {});
  var fields = [];
	var data = _.cloneDeep(this.attributes, function (value) {
    if (value instanceof Document) {
      return value.toObject();
    }
  });

  if (options && options.virtuals) {
    fields = Object.keys(this.constructor.schema.virtuals);
    data = applyGetters(this, data, fields);
  }

  if (options && options.getters) {
    fields = this.constructor.schema.fields();
    data = applyGetters(this, data, fields);
  }

  data.id = this.id;
  return data;
};

Document.prototype.toJSON = function (options) {
  options = _.defaults(options || {}, this.constructor.schema.options.toJSON || {});
	return this.toObject(options);
};

Document.prototype.inspect = function (options) {
  return util.inspect(this.toJSON());
};

Document.prototype.toString = Document.prototype.inspect; 
module.exports = Document;
