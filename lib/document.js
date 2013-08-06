var _ = require('lodash');
var util = require('util');
var Hooks = require('./hooks');
var events = require('events');
var Query = require('./query');

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

var addSimpleGetterSetter = function (obj, field) {
  Object.defineProperty(obj, field, {
    get: function () { return obj.attributes[field]; },
    set: function (value) { obj.attributes[field] = value; }
  });
};

var buildGetterAndSetters = function () {
	var self = this;
	var schema = this.constructor.schema;
	var keys = _.union(schema.fields(), _.keys(schema.models()));
	keys.forEach(function (key) {
		var def = schema.attributes[key];
		var model = def && def.type && self.db.model(def.type) || null;
		Object.defineProperty(self, key, {
			get: function () {
				return self.attributes[key];
			},
			set: function (value) {
				// if the key is a model type and the value is an instance of that model
				// then we need to set the value of the join field.
				if (model && value instanceof model) {
					// set the join field if the value is a model 
					// if the id hasen't been set yet we need to set it once the document
					// has been created.
					if (value.isNew) {
						value.once('save', function (doc) {
							self.attributes[def.field] = doc.id;
              addSimpleGetterSetter(self, def.field);
						});
					}

				}
				self.attributes[key] = value;
			}
		});
	});
};

var Document = function Document (doc, table, constructor, db) {
	doc = doc || {};
	this.table = table;
	this.db = db;
	this.constructor = constructor;
	this.pres = constructor.schema.pres;
	this.posts = constructor.schema.posts;

	events.EventEmitter.call(this);

	var self = this;

	this.runPre('init', [self], function (err) {
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

Document.prototype.hydrate = function (doc) {
	var model = this.constructor.schema.validate(doc);
  var data = _.defaults(doc, model.data);
	var self = this;
	var keys = Object.keys(data);
	keys.forEach(function (key) {
		self[key] = data[key];
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

Document.prototype.save = function (callback) {
	var self = this;

	this.validate(function (err) {
		if (err) return callback(err);

		// Filter out all the documents
		var data = _.omit(self.attributes, function (value) {
			return value instanceof Document;
		});

		// Set the id of the document
		data.id = self.id;
	 
		var query = new Query(self.table, self.db);

		// Run the middleware
		self.runPre('save', [self], function (err) {
			// Handle any middleware errors
			if (err) {
				handleError.call(self, err);
				return callback(err);
			}

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

Document.prototype.toObject = function (options) {
	var data = _.cloneDeep(this.attributes, function (value) {
    if (value instanceof Document) {
      return value.toObject();
    }
  });
  data.id = this.id;
  return data;
};

Document.prototype.toJSON = function (options) {
	return this.toObject(options);
};

module.exports = Document;
