var util = require('util');
var Hooks = require('./hooks');
var schemajs = require('schemajs');
var _ = require('lodash');


var Schema = function Schema (schema, options) {
  this.paths = schema || {};
  this.options = options;
  this.methods = options && options.methods || {};
  this.statics = options && options.statics || {};
  Hooks.call(this);
};

util.inherits(Schema, Hooks);

Schema.prototype.validate = function (doc) {
  var model = schemajs.create(this.paths);
  return model.validate(doc);
};


Schema.prototype.fields = function () {
  var self = this;
  var keys = Object.keys(this.paths);
  return keys.map(function (key) {
    return self.paths[key].field || key;
  });
};


Schema.prototype.models = function (table) {
  var self = this;
  var keys = Object.keys(this.paths);
  var models = {};
  keys.forEach(function (key) {
    if (self.paths[key].field) {
      models[key] = { 
        model: self.paths[key].type,
        field: self.paths[key].field,
        table: table
      };
    }
  });
  return models;
};

Schema.prototype.model = function (path, table) {
  var models = this.models(table);
  return models[path];
};


module.exports = Schema;
