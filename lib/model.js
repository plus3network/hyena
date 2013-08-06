var util = require('util');
var _ = require('lodash');
var Document = require('./document');
var events = require('events');
var Query = require('./query');
var aliasify = require('./aliasify');

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

	// Create a global event emitter
	_.extend(NewModel, events.EventEmitter.prototype);
	events.EventEmitter.call(NewModel);

	// Make the table, schema and db available as static variables
  NewModel.table = table;
  NewModel.schema = schema;
  NewModel.db = db;
	NewModel.modelName = name; 
	NewModel.constructor = NewModel;

	db.models[name] = NewModel;

	// Return the new model class
	return NewModel;
};

Model.find = function (query, fields, options, callback) {
  
  if (typeof(query) === 'function') {
    callback = query;
    query = null;
    fields = null;
    options = null;
  }

  if (typeof(fields) === 'function') {
    callback = fields;
    fields = null;
    options = null;
  }

  if (typeof(options) === 'function') {
    callback = options;
    options = null;
  }

	var self = this;
	var q = new Query(this, true);
  var alias = aliasify(this.table);

  // We must get the id.. no exceptions
	q.select('id');

  if (fields) {
    fields = _.isArray(fields) && fields || String(fields).split(' ');
  } else {
    fields = this.schema.fields();
  }

  if (options) {
    if (options.limit) q.limit(options.limit);
    if (options.skip) q.skip(options.skip);
  }

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

  fields.forEach(function (key) {
    q.select(alias, key, alias);
  });

  if (typeof(callback) == "function") {
    return q.exec(callback);
  }

  return q;
};

module.exports = Model;
