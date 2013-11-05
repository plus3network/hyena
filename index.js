var inflection = require('inflection');
var util       = require('util');
var Schema     = require('./lib/schema');
var Document   = require('./lib/document');
var Query      = require('./lib/query');
var Model      = require('./lib/model');
var parseDSN   = require('./lib/parseDSN');
var schemajs = require('schemajs');
var events = require('events');
var _ = require('lodash');

schemajs.types.join = function (value) {
  return true;
};

var protocols = {
  mysql: require('./lib/mysql'),
  pgsql: require('./lib/pgsql'),
  postgres: require('./lib/pgsql'),
  pg: require('./lib/pgsql')
};

var hyena = module.exports = { };

_.extend(hyena, events.EventEmitter.prototype);
events.EventEmitter.call(hyena);

hyena.Schema = Schema;
hyena.Document = Document;
hyena.Query = Query;
hyena.Model = Model;

hyena.models = {};

hyena.createConnection = function (dsnString, options, callback) {
  if ('string' !== typeof(dsnString)) {
    throw new Error('You must suppy a connection string');
  }

  var dsn = parseDSN(dsnString);
  var protocol = protocols[dsn.protocol];

  if (!protocol) throw new Error("The protocol "+dsn.protocol+" is not supported");
  this.connection = protocol(_.omit(dsn, 'protocol'), options, callback);

};

hyena.bootstrap = require('./lib/bootstrap');

hyena.connect = hyena.createConnection;

hyena.model = function (name, schema, table) {
  // If the user is just getting the model then return it.
  if (arguments.length === 1) return this.models[name];

  if (!table) table = schema.options && schema.options.table; 

  // If the table name isn't supplied then we are going to use the name with
  // underscores and pluralized
  if (!table) {
    table = inflection.underscore(name);
    table = inflection.pluralize(table);
    table = table.toLowerCase();
  }

  // Generate the new model
  var NewModel = Model.generate(name, table, schema, hyena);

  hyena.models[name] = NewModel;

  // Add the custom schema type
  schemajs.types[name] = function (value) {
    return (value instanceof NewModel);
  };

  // Return the new model
  return NewModel;
};
