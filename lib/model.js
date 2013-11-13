var util = require('util');
var _ = require('lodash');
var Document = require('./document');
var events = require('events');
var aliasify = require('./aliasify');
var async = require('async');

var Model = function Model (doc, table, constructor, db) { 
	Document.call(this, doc, table, constructor, db);
};

util.inherits(Model, Document);

Model.generate = function (name, table, schema, db) {
	// Create the new class
  var NewModel = function (doc) { 
    Model.call(this, doc, table, NewModel, db); 
  };

	// Add the model ass a subclass
  util.inherits(NewModel, Model);

	// Extend the static methods
  _.extend(NewModel, Model);

  // Extend the static method from the Schema
  _.extend(NewModel, schema.statics);
  
  // Extend the prototype with the methods
  _.extend(NewModel.prototype, schema.methods);

	// Create a global event emitter
	_.extend(NewModel, events.EventEmitter.prototype);
	events.EventEmitter.call(NewModel);



	// Make the table, schema and db available as static variables
  NewModel.table = table;
  NewModel.schema = schema;
  NewModel.db = db;
	NewModel.modelName = name; 
	NewModel.constructor = NewModel;

	// Return the new model class
	return NewModel;
};

Model.validatePath = function (path) {
  var modelPaths = Object.keys(this.schema.models());
  var virtuals = Object.keys(this.schema.virtuals);
  var paths = _.union(this.schema.fields(), modelPaths, virtuals);
  // if it's a subpath we need to walk the schemas to see if the path is valid.
  if(/\./.test(path)) { 
    var parts = path.split('.');
    var modelName = this.schema.paths[parts[0]].type;
    var model = this.db.model(modelName);
    return model.validatePath(_.last(parts, parts.length-1).join('.'));
  } else {
    return !!~paths.indexOf(path);
  }
};

Model.getType = function (path) {
  // if it's a subpath we need to walk the schemas to see if the path is valid.
  if(/\./.test(path)) { 
    var parts = path.split('.');
    var modelName = this.schema.paths[parts[0]].type;
    var model = this.db.model(modelName);
    return model.validatePath(_.last(parts, parts.length-1).join('.'));
  } else {
    return this.schema.paths[path];
  }
};

Model.create = function (doc, callback) {
  var self = this;
  var args;
  var results = [];
  if (_.isArray(doc)) {
    args = doc;
  } else {
    args = Array.prototype.slice.call(arguments);
    callback = _.last(args);
    args = _.first(args, args.length-1);
  }

  async.each(args, function (doc, done) {
    var obj = new self.constructor(doc);
    obj.save(done);
    results.push(obj);
  }, function (err) {
    if (err) return callback(err);
    if(results.length === 1) {
      callback(null, results[0]);
    } else {
      callback(null, results);
    }
  });
};

Model.find = function (query, fields, options, callback) {
  
  if (typeof(query) === 'function') {
    callback = query;
    query = {};
    fields = null;
    options = {};
  }

  if (typeof(fields) === 'function') {
    callback = fields;
    fields = null;
    options = {};
  }

  if (typeof(options) === 'function') {
    callback = options;
    options = {};
  }

  // need to guarnatee options is set and that we are setting the useAlias
  // options so when we do populates they take hold.
  options = options || {};
  options.useAlias = true;

	var self = this;
	var q = new this.db.Query(this, options);
  var alias = aliasify(this.table);

  // For now we just support basic query expressions. If you need
  // something more expressive use the query interface.
  if (query) {
    Object.keys(query).forEach(function (key) {
      if(_.isArray(query[key])) {
        q.where(key).in(query[key]);
      } else {
        q.where(key).equals(query[key]);
      }
    });
  }

  if (fields) {
    q.select(fields);
  }

  if (options) {
    if (options.limit) q.limit(options.limit);
    if (options.skip) q.skip(options.skip);
    if (options.offset) q.offset(options.offset);
  }

  if (typeof(callback) == "function") {
    return q.exec(callback);
  }

  return q;
};

Model.findOne = function (query, fields, options, callback) {
  if (typeof(query) === 'function') {
    callback = query;
    query = {};
    fields = null;
    options = {};
  }

  if (typeof(fields) === 'function') {
    callback = fields;
    fields = null;
    options = {};
  }

  if (typeof(options) === 'function') {
    callback = options;
    options = {};
  }

  options = options || {};
  options.limit = 1;
  options.returnOne = true;

  return this.find.call(this, query, fields, options, callback);
};

Model.findById = function (id, fields, options, callback) {

  if (typeof(fields) === 'function') {
    callback = fields;
    fields = null;
    options = {};
  }

  if (typeof(options) === 'function') {
    callback = options;
    options = {};
  }

  var query = { id: id };
  options = options || {};
  options.limit = 1;
  options.returnOne = true;

  return this.find.call(this, query, fields, options, callback);
};

Model.removeByQuery = function (query, options, callback) {
  
  if (typeof(query) === 'function') {
    callback = query;
    query = {};
    options = {};
  }

  if (typeof(options) === 'function') {
    callback = options;
    options = {};
  }

  // need to guarnatee options is set and that we are setting the useAlias
  // options so when we do populates they take hold.
  options = options || {};

	var self = this;
	var q = new this.db.Query(this, options);
  q.delete();

  // For now we just support basic query expressions. If you need
  // something more expressive use the query interface.
  if (query) {
    Object.keys(query).forEach(function (key) {
      if(_.isArray(query[key])) {
        q.where(key).in(query[key]);
      } else {
        q.where(key).equals(query[key]);
      }
    });
  }


  if (typeof(callback) == "function") {
    return q.exec(callback);
  }

  return q;
 
}

Model.remove = function (callback) {
  var conn = this.db.connection;
  var query = "TRUNCATE TABLE "+this.table;
  conn.query(query, callback);
};

var manyToMany = function (doc, def, options, callback) {
  var model = this.db.model(def.schema.type);
  var query = new this.db.Query(model, { useAlias: true });
  var match = options.match || def.schema.match;

  if (options.select) {
    query.select(options.select);
  }

  query
    .join(def.schema.through, def.schema.foreign_key, 'INNER', aliasify(options.path))
    .on(aliasify('parent'), 'id')
    .where(aliasify(options.path), def.schema.field)
    .equals(doc.id);
  if (match) {
    _.forIn(match, function (value, key) {
      query.where(aliasify(options.path), key);
      if(_.isArray(value)) {
        query.in(value);
      } else {
        query.equals(value);
      }
    });
  }
  query
    .exec(function (err, docs) {
      if (err) return callback(err);
      doc.set(options.path, docs);
      callback(null, doc);
    });

};

var oneToOne = function (doc, def, options, callback) {
  var model = this.db.model(def.type);

  if (doc.get(options.path) && options.populate) {
    return doc.get(options.path).populate(options.populate, callback);
  }

  if (!doc.get(def.field)) return callback(null, doc);

  var query = model.findById(doc[def.field]);
  var populateOptions = {};
  if (options.populate) {
    populateOptions.path = options.populate;
    populateOptions.select = options.select;
    query.populate(populateOptions);
  } else {
    query.select(options.select);
  }

  query.exec(function (err, subdoc) {
    if (err) return callback(err);
    doc.set(options.path, subdoc);
    callback(null, doc);
  });
};

var oneToMany = function (doc, def, options, callback) {
  var model = this.db.model(def.schema.type);
  var query = model.find().where(def.schema.foreign_key).equals(doc.id);
  var match = options.match || def.schema.match;
  if (options.select) {
    query.select(options.select);
  }
  if (match) {
    _.forIn(match, function (value, key) {
      query.where(key);
      if(_.isArray(value)) {
        query.in(value);
      } else {
        query.equals(value);
      }
    });
  }
  query.exec(function (err, docs) {
    if (err) return callback(err);
    doc.set(options.path, docs);
    callback(null, doc);
  });
};

var populateAll = function (doc, path, callback) {
  var paths = path.split(/\s/);
  async.eachSeries(paths, doc.populate.bind(doc), function (err) {
    if (err) return callback(err);
    callback(null, doc);
  });
};

Model.populate = function (doc, path, callback) {
  var options = {};
  var parts;
  var self = this;
  var tasks = [];

  // If the doc is an array we need to run the populate on each doc
  // of the array in parallel.
  if(_.isArray(doc)) {
    doc.forEach(function (d) {
      tasks.push(function (cb) {
        d.populate(path, cb);
      });
    });
    return async.parallel(tasks, callback);
  }

  // To support the shitload of multiple signatures we need to check 
  // if the path is a string or an object.
  if ('string' === typeof(path)) {
    if (/\s/.test(path)) {
      return populateAll(doc, path, callback);
    }
    options = { path: path };
  } else {
    options = path;
  }

  // If the path is to child then we need to do a bit of magic to find the
  // child and populate that along with the subchild.
  if (/\./.test(options.path)) {
    // do somepath magic;
    parts = options.path.split('.');
    options.path = parts[0];
    options.populate = _.last(parts, parts.length-1).join('.');
  }

  // We need to get the schema definition for the path
  var def = this.schema.model(options.path); 
  
  // If the schema type is an join then we have a many-to-many or one-to-many
  // relationsship and we need to handle it differently then the one-to-one
  if (def && def.type === 'join') {
    // many to many
    if (def.schema.through) {
      return manyToMany.call(this, doc, def, options, callback);
    }
    // one to many
    if (def.schema.foreign_key && !def.schema.through) {
      return oneToMany.call(this, doc, def, options, callback);
    }
  } else if (def && def.type) {
    return oneToOne.call(this, doc, def, options, callback);
  }

  callback(null, doc);
};

module.exports = Model;
