var util = require('util');
var Hooks = require('./hooks');
var schemajs = require('schemajs');
var _ = require('lodash');


var Schema = function Schema (schema, options) {
  var defaultOptions = { 
    table: null,
    allownull: true,
    toObject: { getters: false, virtuals: false },
    toJSON: { getters: false, virtuals: false } ,
    primaryKey: 'id'
  };
  this.paths = schema || {};


  this.options = _.defaults(options || {}, defaultOptions);
  this.methods = options && options.methods || {};
  this.statics = options && options.statics || {};
  this.virtuals= {};
  Hooks.call(this);
};

util.inherits(Schema, Hooks);

Schema.prototype.validate = function (doc) {
  var self = this;

  // We need to allownull by default
  _.forIn(self.paths, function (def, key) {
    if (!def.required && def.allownull == null) {
      self.paths[key].allownull = true;
    }
  });


  var model = schemajs.create(this.paths);
  return model.validate(doc);
};

Schema.prototype.set = function (key, value) {
  this.options[key] = value;
};

Schema.prototype.virtual = function (path) {
  var self = this;
  this.virtuals[path] = this.virtuals[path] || { get: function () {}, set: function () { } };

  return {
    get: function (fn) {
      self.virtuals[path].get = fn;
    },
    set: function (fn) {
      self.virtuals[path].set = fn;
    }
  };
};

Schema.prototype.fields = function () {
  var self = this;
  var keys = Object.keys(this.paths);
  return _(this.paths)
    .keys()
    .filter(function (path) {
      return self.paths[path].type !== 'join';
    })
    .map(function (key) {
      return self.paths[key].field || key;
    })
    .value();
};


Schema.prototype.models = function (table) {
  var self = this;
  var keys = Object.keys(this.paths);
  var models = {};
  keys.forEach(function (key) {
    if (self.paths[key].field || self.paths[key].type === 'join') {
      var def = _.cloneDeep(self.paths[key]);
      def.table = table;
      models[key] = def;
    }
  });
  return models;
};

Schema.prototype.model = function (path, table) {
  var models = this.models(table);
  return models[path];
};


module.exports = Schema;
