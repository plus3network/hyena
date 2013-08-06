var util = require('util');
var _ = require('lodash');
var Document = require('./document');
var events = require('events');
var Query = require('./query');

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

Model.find = function (query, fields, populate, callback) {
	var self = this;

	var q = new Query(this);

	q.select(this.table, 'id',  this.modelName);
	this.schema.fields().forEach(function (key) {
		q.select(self.table, key, self.modelName);
	});

	populate.forEach(q.populate.bind(q));

	q.exec(callback);
  return q;
};

module.exports = Model;
