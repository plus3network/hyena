var util = require('util');
var Hooks = require('./hooks');
var schemajs = require('schemajs');


var Schema = function Schema (schema, options) {
  this.attributes = schema || {};
  this.options = options;
  this.methods = options && options.methods || {};
  this.statics = options && options.statics || {};
  Hooks.call(this);
};

util.inherits(Schema, Hooks);

Schema.prototype.validate = function (doc) {
  var model = schemajs.create(this.attributes);
  return model.validate(doc);
};

Schema.prototype.fields = function () {
  var self = this;
  var keys = Object.keys(this.attributes);
  return keys.map(function (key) {
    return self.attributes[key].field || key;
  });
};


Schema.prototype.models = function (table) {
  var self = this;
  var keys = Object.keys(this.attributes);
  var models = {};
  keys.forEach(function (key) {
    if (self.attributes[key].field) {
      models[key] = { 
        model: self.attributes[key].type,
        field: self.attributes[key].field,
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
