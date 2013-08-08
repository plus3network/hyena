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

  query = { id: id };
  options = options || {};
  options.limit = 1;
  options.returnOne = true;

  return this.find.call(this, query, fields, options, callback);
};

Model.remove = function (callback) {
  var conn = this.db.connection;
  var query = "TRUNCATE TABLE "+this.table; 
  conn.query(query, callback);
};

module.exports = Model;
