var util = require('util');
var _ = require('lodash');
var mpath = require('mpath');

function Query(model) {
  this.model = model;
  this.table = model.table;
  this.db = model.db;

  this.data = { 
    type: 'SELECT', 
    limit: null, 
    order: [], 
    fields: [], 
    join: {}, 
    joins: [], 
    stmt: null, 
    stmts: [],
    values: [],
    population: {},
    paths: []
  };
}

Query.prototype.upsert = function (doc) {
  var self = this;
  var stmts = [];
  this.data.type = 'UPSERT';
  this.data.fields.push(Object.keys(doc).map(function (key) {
    self.data.values.push(doc[key]);
    return self.escapeId(self.table, key)+' = ?';
  }).join(', '));
  this.data.fields.push(Object.keys(_.omit(doc, 'id')).map(function (key) {
    self.data.values.push(doc[key]);
    return self.escapeId(self.table, key)+' = ?';
  }).join(', '));
  return this;
};

var extractFields = function (prefix, obj) {
  var data = {};
  var keys = _.filter(Object.keys(obj), function (key) {
    return ~key.indexOf(prefix);
  });
  keys.forEach(function (key) {
    var newKey = key.replace(prefix, '');
    data[newKey] = obj[key]; 
  });
  return data;
};

Query.prototype.hydrate = function (results) {
  var data = [];
  var self = this;
  this.data.paths.sort();
  results.forEach(function(row) {
    var newObj = new self.model(extractFields(self.model.modelName+'_', row)); 
    self.data.paths.forEach(function (path) {
      var parts = path.split('.');
      var modelName = self.data.population[parts[parts.length-1]].model; 
      var model = self.db.model(modelName);
      var subObj = new model(extractFields(modelName+'_', row));
      mpath.set(path, subObj, newObj);
    });
    data.push(newObj);
  });
  return data;
};

Query.prototype.exec = function (callback) {
  var self = this;
  this.db.connection.query(this.toString(), this.values(), function (err, results) {
    if (err) return callback(err);
    var data = self.hydrate(results);
    callback(null, data);
  });
};

Query.prototype.select = function (table, id, name) {
  if (arguments.length === 0) return this;

  if (arguments.length === 1) {
    table = this.table;
    id = arguments[0];
    name = table;
  }

  if (arguments.length === 2) {
    table = arguments[0];
    id = arguments[1];
    name = table;
  }

  var as = name+'_'+id;
  this.data.fields.push(this.escapeId(table, id)+' AS '+as);
  return this;
};

Query.prototype.escapeId = function (table, id) {
  if (arguments.length === 2) {
    return '`'+table+'`.`'+id+'`';
  }
  return '`'+table+'`';
};

Query.prototype.fields = function () {
  if (this.data.fields.length === 0) return this.escapeId(this.table)+'.*';
  return this.data.fields.join(', ');
};

Query.prototype.join = function (table, field, type) {
  this.data.join.type = (type)? type.toUpperCase() : 'INNER';
  this.data.join.table = table;
  this.data.join.field = field;
  return this;
};

Query.prototype.on = function (table, id) {
  if (arguments.length === 1) {
    id = table;
    table = this.table;
  }
  this.data.join.on = this.escapeId(table, id);
  this.data.joins.push(this.data.join);
  this.data.join = {};
  return this;
};

Query.prototype.getJoins = function () {
  if (this.data.joins.length !== 0) {
    var self = this;
    var j = [];
    this.data.joins.forEach(function (join) {
      j.push(join.type+' JOIN '+self.escapeId(join.table)+' ON ('+self.escapeId(join.table, join.field)+' = '+join.on+')');
    });
    return j.join(' ');
  }
};

Query.prototype.populate = function (path) {

  var population = this.data.population;
  var self = this;
  this.data.paths.push(path); 

	var populateIt = function (path) {
		var self = this;
		var parts = path.split('.');		
		if (population[path]) return;
		parts.forEach(function partIt (part, index) {
			var model = self.schema.model(part, self.table);
			if (model) {
				population[part] = model;
			} else if(index > 0) {
				var m = self.db.model(population[parts[index-1]].model);
				if (m) populateIt.call(m, part);
			}
		});
	};

  populateIt.call(this.model, path);

};

Query.prototype.processPopulates = function () {
  var self = this;
	_.forIn(this.data.population, function (value, key) {
		var model = self.db.model(value.model);	
		self.select(model.table, 'id', model.modelName);
		model.schema.fields().forEach(function (key) {
			self.select(model.table, key, model.modelName);
		});
		self.join(model.table, 'id').on(value.table, value.field);
	});
};

Query.prototype.where = function (table, id) {
  if (this.data.stmt) this.data.stmts.push(this.data.stmt);
  if (arguments.length === 1) {
    id = table;
    table = this.table;
  }
  this.data.stmt = { field: this.escapeId(table, id), not: false };
  return this;
};


Query.prototype.equals = function (value) {
  this.data.stmt.op = '=';
  this.data.stmt.value = value;
  return this;
};

Query.prototype.gt = function (value) {
  this.data.stmt.op = '>';
  this.data.stmt.value = value;
  return this;
};

Query.prototype.lt = function (value) {
  this.data.stmt.op = '<';
  this.data.stmt.value = value;
  return this;
};

Query.prototype.gte = function (value) {
  this.data.stmt.op = '>=';
  this.data.stmt.value = value;
  return this;
};

Query.prototype.lte = function (value) {
  this.data.stmt.op = '<=';
  this.data.stmt.value = value;
  return this;
};

Query.prototype.between = function (start, end) {
  this.data.stmt.op = 'BETWEEN';
  this.data.stmt.value = [start, end];
  return this;
};

Query.prototype.in = function () {
  this.data.stmt.op = 'IN';
  if (_.isArray(arguments[0])) {
    this.data.stmt.value = arguments[0];
  } else {
    this.data.stmt.value = Array.prototype.slice.call(arguments);
  }
  return this;
};

Query.prototype.like = function (value) {
  this.data.stmt.op = 'LIKE';
  this.data.stmt.value = value;
  return this;
};

Query.prototype.isNull = function () {
  this.data.stmt.op = 'IS';
  return this;
};

Query.prototype.not = function () {
  this.data.stmt.not = true;
  return this;
};

var opPatterns = {
  '=': function () { 
    return '?';
  },

  '>': function () { 
    return '?';
  },

  '<': function () { 
    return '?';
  },

  '>=': function () { 
    return '?';
  },

  '<=': function () { 
    return '?';
  },

  'LIKE': function () { 
    return '?';
  },

  'BETWEEN': function () { 
    return '? AND ?'; 
  },

  'IN': function (values) {
    return '('+values.map(function() { return '?'; }).join(',')+')';
  },

  'IS': function () {
    return 'NULL'; 
  }
};

Query.prototype.transformStmts = function () {
  if (this.data.stmt) this.data.stmts.push(this.data.stmt);
  var self = this;
  var stmts = this.data.stmts.map(function (stmt) {
    var s = [];
    if (stmt.not) s.push('NOT');
    s.push(stmt.field);
    s.push(stmt.op);
    s.push(opPatterns[stmt.op](stmt.value));
    return s.join(' '); 
  });
  return stmts.join(' AND ');
};

Query.prototype.values = function () {
  if (this.data.values.length === 0) {
    this.data.values = _(this.data.stmts)
      .filter(function (stmt) {
        return !!stmt.value;
      })
      .map(function (stmt) {
        return stmt.value;
      })
      .flatten()
      .value();
    if (this.data.limit) this.data.values.push(this.data.limit);
    if (this.data.offset) this.data.values.push(this.data.offset);
  }
  return this.data.values;
};

Query.prototype.limit = function (value) {
  this.data.limit = value;
  return this;
};

Query.prototype.offset = function (value) {
  this.data.offset = value;
  return this;
};

Query.prototype.order = function (table, field, dir) {
  if (arguments.length < 3) {
    dir = field;
    field = table;
    table = this.table;
  }
  dir = (dir && dir.toLowerCase() === 'desc')? 'DESC' : 'ASC';
  this.data.order.push(this.escapeId(table, field)+' '+dir);
  return this;
};

var stringify = {
  'SELECT': function () {
    var query = [];
    if (this.data.paths.length !== 0) this.processPopulates();
    query.push(this.data.type);
    query.push(this.fields());
    query.push("FROM");
    query.push(this.escapeId(this.table));
    if (this.data.joins.length > 0) query.push(this.getJoins());
    if (this.data.stmt) query.push("WHERE");
    query.push(this.transformStmts());
    if (this.data.order.length !== 0) {
      query.push('ORDER BY');
      query.push(this.data.order.join(', '));
    }
    if (this.data.limit) query.push('LIMIT ?');
    if (this.data.offset) query.push('OFFSET ?');
    return query.join(' '); 
  },

  'UPSERT': function () {
    var query = [];
    query.push('INSERT INTO');
    query.push(this.escapeId(this.table));
    query.push('SET');
    query.push(this.data.fields[0]);
    query.push('ON DUPLICATE KEY UPDATE');
    query.push(this.data.fields[1]);
    return query.join(' '); 

  }
};

Query.prototype.toString = function () {
  return stringify[this.data.type].call(this);
};

module.exports = Query;
