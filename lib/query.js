var util = require('util');
var _ = require('lodash');
var mpath = require('mpath');
var inflection = require('inflection');
var aliasify = require('./aliasify');

var createSelectsLookup = function (fields) {
  var lookup = {};
  fields.forEach(function (key) {
    lookup[key] = true;
  });
  return lookup;
};

function Query(model, options) {
  this.model = model;
  this.table = model.table;
  this.db = model.db;
  this.primaryKey = model.schema.options.primaryKey;

  this.options = _.defaults(options || {}, {
    useAlias: false,
    returnOne: false,
    lean: false
  });

  this.data = { 
    type: 'SELECT', 
    alias: this.options.useAlias && aliasify('parent') || null,
    limit: null, 
    order: [], 
    selects: { },
    fields: [], 
    join: {}, 
    joins: [], 
    stmt: null, 
    stmts: [],
    values: [],
    population: {},
    paths: [],
    pathFields: {},
    pathMatches: {}
  };

  var self = this;
  var table = this.data.alias || this.table;
  if (!this.data.selects[table]) this.data.selects[table] = {};
  this.data.selects[table] = createSelectsLookup(this.model.schema.fields());

}

Query.prototype.option = function (name, value) {
  this.options[name] = value;
  return this;
};

Query.prototype.lean = function () {
  this.option('lean', true);
  return this;
};

Query.prototype.upsert = function (doc) {
  var self = this;
  var stmts = [];
  this.data.type = 'UPSERT';
  var keys = this.model.schema.fields();
  if (this.primaryKey) keys.push(this.primaryKey);
  this.data.fields.push(keys.map(function (key) {
    self.data.values.push(doc[key]);
    return self.escapeId(self.table, key)+' = ?';
  }).join(', '));
  this.data.fields.push(_.without(keys, this.primaryKey).map(function (key) {
    self.data.values.push(doc[key]);
    return self.escapeId(self.table, key)+' = ?';
  }).join(', '));
  return this;
};

Query.prototype.delete = function () {
  this.data.type = 'DELETE';
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
  var paths = Object.keys(this.data.population);
  results.forEach(function(row) {
    if (self.options.lean) {
      var newObj = extractFields(self.data.alias+'_', row); 
    } else {
      var newObj = new self.model(extractFields(self.data.alias+'_', row)); 
      newObj.selected = _.omit(self.data.selects[self.data.alias], '$__dirty');
    }

    paths.forEach(function (path) {
      var modelName = self.data.population[path].type; 
      var model = self.db.model(modelName);
      if(self.options.lean) {
        var subObj = extractFields(aliasify(path)+'_', row);
      } else {
        var subObj = new model(extractFields(aliasify(path)+'_', row));
        subObj.selected = _.omit(self.data.selects[aliasify(path)], '$__dirty');
      }
      mpath.set(path, subObj, newObj);
    });
    data.push(newObj);
  });
  return data;
};

Query.prototype.exec = function (callback) {
  var self = this;
  var data;
  var query = this.toString();
  var values = this.values();
  this.db.connection.query(query, values, function (err, results) {

    if (err) {
      err.query = query;
      err.values = values;
      return callback(err);
    }

    if (self.data.type === 'SELECT') {
      data = self.hydrate(results);
    } else {
      data = results;
    }

    if (self.options.returnOne) {
      data = data[0] || null;
    }

    callback(null, data);
  });
};


Query.prototype.select = function (table, subject) {
  var self = this;
  var defaultAction = false, field, fields, selects = {};

  if (arguments.length === 1) {
    subject = table;
    table = this.data.alias || this.table;
  }

  // If the subject is a string then we need to convert it into an object
  // and remove the negative from the keys
  if('string' === typeof(subject)) {
    fields = subject.split(' ');
    fields.forEach(function (value) {
      var val = !/-/.test(value);
      var key = value.replace(/-/g, '');
      selects[key] = val;
    });
  }

  // if it's an object we need to transform the 1/0 into true/false
  if('object' === typeof(subject)) {
    selects = subject;
    _.forIn(selects, function (value, key) { 
      selects[key] = !! value;
    });
  }

  // If the action is only subtractive then we need to set the defaultAction
  // to true so we will show all the fields except the ones being removed.
  defaultAction = !(!!~_.unique(_.values(selects)).indexOf(true));

  // Ugh... WE need to loop through the selects lookup table and set the new values
  // if we've done this before (which $__dirty) indicates then we igore the defaultAction
  // otherwise we need to apply it.
  _.forIn(_.omit(this.data.selects[table], '$__dirty'), function (value, key) {
    if (selects[key] != null) {
      self.data.selects[table][key] = selects[key];
    } else {
      if (self.data.selects[table].$__dirty !== true) {
        self.data.selects[table][key] = defaultAction;
      }
    }
  });

  // Dirty the lookup table so we know not to apply the defaultAction in
  // successive selects
  this.data.selects[table].$__dirty = true;

  return this;
};

Query.escapeId = function (table, id) {
  if (arguments.length === 2) {
    return '`'+table+'`.`'+id+'`';
  }
  return '`'+table+'`';
};

Query.prototype.escapeId = Query.escapeId;

Query.prototype.fields = function () {
  var self    = this;
  var selects = this.data.selects;
  var tables  = Object.keys(selects);
  var fields  = [];

  tables.forEach(function (table) {
    if (self.primaryKey) {
      fields.push(self.escapeId(table, self.primaryKey)+' AS '+table+'_' + self.primaryKey);
    }
    _.forIn(_.omit(selects[table], '$__dirty'), function (include, field) {
      if (include) {
        fields.push(self.escapeId(table, field)+' AS '+table+'_'+field);
      }
    });
  });

  return fields.join(', ');
};

Query.prototype.join = function (table, field, type, alias) {
  if(this.data.join.type) this.data.joins.push(this.data.join);
  this.data.join = {};
  this.data.join.type = (type)? type.toUpperCase() : 'INNER';
  this.data.join.table = table;
  this.data.join.field = field;
  this.data.join.alias = alias;
  return this;
};

Query.prototype.on = function (table, id, alias) {
  if (arguments.length === 1) {
    id = table;
    table = this.table;
  }
  table = alias ? alias : table;
  this.data.join.on = this.escapeId(table, id);
  return this;
};

Query.prototype.match = function (field, op, value) {
  var self = this;
  this.data.join.matches = this.data.join.matches || []; 
  if ('string' === typeof(field)) {
    this.data.join.matches.push({
      field: field,
      op: op || '=',
      value: value
    });
  } else if ('object' === typeof(field)) {
    _.forIn(field, function (value, key) {
      var match = { field: key, value: value, };
      if (_.isArray(value)) {
        match.op = 'IN';
      } else {
        match.op = '=';
      }
      self.data.join.matches.push(match);
    });
  }
  return this;
};

Query.prototype.getJoins = function () {
  if(this.data.join.type) this.data.joins.push(this.data.join);
  this.data.join = {};
  if (this.data.joins.length !== 0) {
    var self = this;
    var j = [];
    this.data.joins.forEach(function (join) {
      var on = [];
      var s = [];
      s.push(join.type);
      s.push('JOIN');
      s.push(self.escapeId(join.table));
      if (join.alias) s.push('AS '+self.escapeId(join.alias));
      on.push(self.escapeId(join.alias || join.table, join.field)+' = '+join.on);
      if (join.matches) {
        join.matches.forEach(function (match) {
          var string = [];
          string.push(self.escapeId(join.alias || join.table, match.field));
          string.push(match.op);
          string.push(opPatterns[match.op](match.value));
          self.data.values.push(match.value);
          on.push(string.join(' '));
        });
      }
      s.push('ON ('+on.join(' AND ')+')');
      j.push(s.join(' '));
    });
    return j.join(' ');
  }
};

Query.prototype.populate = function (options) {
  var population = this.data.population;
  var self = this;
  var path;

  if ('string' === typeof(options)) {
    path = options;
    if (/\s/.test(path)) {
      path.split(/\s/).forEach(function (newPath) {
        self.populate(newPath);
      });
      return this;
    }
  } else {
    path = options.path;
    if (options.select) {
      this.data.pathFields[path] = options.select;
    }
    if (options.match) {
      this.data.pathMatches[path] = options.match;
    }
  }

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
          var m = self.db.model(population[parts[index-1]].type);
          if (m) populateIt.call(m, part);
        }
      });
  };

  populateIt.call(this.model, path);

  return this;
};


Query.prototype.processPopulates = function () {
  var self = this;
  var newPop = {};
  var parentAlias = this.data.alias;
  this.data.paths.forEach(function (path) {
    var parts = path.split('.');
    parts.forEach(function (part, index) {
      var key = _.first(parts, index+1).join('.');
      if (self.data.population[part]) {
        newPop[key] = _.cloneDeep(self.data.population[part]);
        newPop[key].parent = (index === 0)? parentAlias : aliasify(_.first(parts, index).join('.')) ;
      }
    });
  });

  this.data.population = newPop;

	_.forIn(newPop, function (value, path) {
		var model = self.db.model(value.type);	
    self.data.selects[aliasify(path)] = createSelectsLookup(model.schema.fields());
    if (self.data.pathFields[path]) {
      self.data.pathFields[path].split(' ').forEach(function (select) {
        self.select(aliasify(path), select);
      });
    }
		self.join(model.table, model.schema.options.primaryKey, value.joinType || 'inner', aliasify(path)).on(value.parent, value.field);
    if (self.data.pathMatches[path]) {
      self.match(self.data.pathMatches[path]);
    }
	});
};

Query.prototype.where = function (table, id) {
  var parts;
  if (this.data.stmt) this.data.stmts.push(this.data.stmt);
  if (arguments.length === 1) {
    id = table;
    if (/\./.test(id)) {
      parts = id.split('.');
      table = aliasify(_.first(parts, parts.length-1).join('.'));
      id = parts[parts.length-1];
    } else {
      table = this.data.alias || this.table;
    }

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
  if (this.data.stmt && this.data.stmt.op) this.data.stmts.push(this.data.stmt);
  this.data.stmt = {};
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
  var values = _(this.data.stmts)
    .filter(function (stmt) {
      return stmt.value != null;
    })
    .map(function (stmt) {
      return stmt.value;
    })
    .flatten()
    .value();
  this.data.values = this.data.values.concat(values);
  if (this.data.limit) this.data.values.push(this.data.limit);
  if (this.data.offset) this.data.values.push(this.data.offset);
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

// Alias for offset  
Query.prototype.skip = Query.prototype.offset;

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

Query.prototype.sort = function (op) {
  var self = this;
  var sort = {};
  if ('string' === typeof(op)) {
    op.split(' ').forEach(function (val) {
      var dir = !/-/.test(val);
      var key = val.replace('-','');
      sort[key] = dir;
    });
  }
  
  if ('object' === typeof(op)) {
    _.forIn(op, function (value, key) {
      if ('string' === typeof(value)) {
        value = (value === 'asc') ? 1 : -1;
      }
      sort[key] = value > 0;
    });
  }

  _.forIn(sort, function (dir, field) {
    var path = self.data.alias || self.table;
    var parts;
    if (field.match(/\./)) {
      parts = field.split('.'); 
      path = aliasify(_.first(parts, parts.length-1).join('.')); 
      field = parts[parts.length-1];
    }
    self.order(path, field, (dir)? 'ASC' : 'DESC');
  });

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
    if(this.data.alias) query.push('AS '+this.escapeId(this.data.alias));
    var joins = this.getJoins();
    if (joins) query.push(joins);
    if (this.data.stmt) query.push("WHERE");
    var stmts = this.transformStmts();
    if (stmts) query.push(stmts);
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
  },

  'DELETE': function () {
    var query = [];
    query.push(this.data.type);
    query.push('FROM');
    query.push(this.escapeId(this.table));
    if (this.data.stmt) query.push("WHERE");
    var stmts = this.transformStmts();
    if (stmts) query.push(stmts);
    return query.join(' ');
  }

};

Query.prototype.toString = function () {
  return stringify[this.data.type].call(this);
};

module.exports = Query;
