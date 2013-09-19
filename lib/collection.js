var _ = require('lodash');

var Collection = module.exports = function (path, def, doc, array) {
  array.path = path;
  array.def = def;
  array.doc = doc;
  array = array || [];
  array.__proto__ = Collection.prototype;
  return array;
};

Collection.prototype = new Array();

Collection.prototype.add = function (doc, additionalFields, callback) {

  if ('function' === typeof(additionalFields)) {
    callback = additionalFields;
    additionalFields = {};
  }

  var values = [];

  additionalFields[this.def.schema.field] = this.doc.id;
  additionalFields[this.def.schema.foreign_key] = doc.id;

  // Check to see the doc isn't allready a member
  if(_.find(this, function (d) {
    return d.id === doc.id;
  })) {
    return callback();
  }

  var Query = this.doc.db.Query;
  var conn = this.doc.db.connection;
  var query = [];
  var stmt = [];
  var self = this;

  query.push("INSERT INTO");
  query.push(Query.escapeId(this.def.schema.through));
  query.push('SET');


  _.forIn(additionalFields, function (value, key) {
    var s = [];
    s.push(Query.escapeId(self.def.schema.through, key));
    s.push('=');
    s.push('?');
    stmt.push(s.join(' '));
    values.push(value);
  });

  query.push(stmt.join(', '));

  var updateFields = _.omit(additionalFields, this.def.schema.field, this.def.schema.foreign_key);
  if (Object.keys(updateFields).length > 0) {
    query.push('ON DUPLICATE KEY UPDATE');
    var updateStatement = [];

    _.forIn(updateFields, function (value, key) {
      var s = [];
      s.push(Query.escapeId(self.def.schema.through, key));
      s.push('=');
      s.push('?');
      updateStatement.push(s.join(' '));
      values.push(value);
    });

    query.push(updateStatement.join(', '));
  }

  var sql = query.join(' ');
  self.doc.runPre('add:'+self.path, [self.doc], function (err) {
    if (err) return callback(err);
    conn.query(sql, values, function (err, results) {
      if (err) return callback(err);
      self.doc.runPost('add:'+self.path, [self.doc], function (err) {
        if (err) return callback(err);
        self.doc.populate(self.path, callback);
      });
    });
  });
};

Collection.prototype.remove = function (id, callback) {
  var Query = this.doc.db.Query;
  var conn = this.doc.db.connection;
  var query = [];
  var self = this;

  query.push("DELETE FROM");
  query.push(Query.escapeId(this.def.schema.through));
  query.push('WHERE');
  query.push(Query.escapeId(this.def.schema.through, this.def.schema.field));
  query.push('=');
  query.push('?');
  query.push('AND');
  query.push(Query.escapeId(this.def.schema.through, this.def.schema.foreign_key));
  query.push('=');
  query.push('?');
  
  self.doc.runPre('remove:'+self.path, [self.doc], function (err) {
    if (err) return callback(err);
    conn.query(query.join(' '), [self.doc.id, id], function (err, results) {
      if (err) return callback(err);
      self.doc.runPost('remove:'+self.path, [self.doc], function (err) {
        if (err) return callback(err);
        self.doc.populate(self.path, callback);
      })
    });
  });

};
