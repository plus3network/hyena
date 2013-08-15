var _ = require('lodash');

var Collection = module.exports = function (def, doc, array) {
  array.def = def;
  array.doc = doc;
  array = array || [];
  array.__proto__ = Collection.prototype;
  return array;
};

Collection.prototype = new Array;

Collection.prototype.add = function (doc, callback) {

  // Check to see the doc isn't allready a member
  if(_.find(this, function (d) {
    return d.id === doc.id;
  })) {
    return callback();
  }

  var Query = this.doc.db.Query;
  var conn = this.doc.db.connection;
  var query = [];
  var self = this;

  query.push("INSERT INTO");
  query.push(Query.escapeId(this.def.schema.through));
  query.push('SET');
  query.push(Query.escapeId(this.def.schema.through, this.def.schema.field));
  query.push('=');
  query.push('?,');
  query.push(Query.escapeId(this.def.schema.through, this.def.schema.foriegn_key));
  query.push('=');
  query.push('?');

  conn.query(query.join(' '), [this.doc.id, doc.id], function (err, results) {
    if (err) return callback(err);
    self.push(doc);
    callback(null, doc);
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
  query.push(Query.escapeId(this.def.schema.through, this.def.schema.foriegn_key));
  query.push('=');
  query.push('?');

  conn.query(query.join(' '), [this.doc.id, id], function (err, results) {
    if (err) return callback(err);
    // Because we have this custom array like object we need
    // to do some swappy filtery stuff to perserve the object type
    var tmp = [];

    // loop throgh the array and push pop everything and push only
    // the docs that don't match this id to the tmp array
    for (var i = self.length - 1; i >= 0; i--) {
      d = self.pop();
      if (d.id !== id) {
        tmp.push(d);
      }
    }

    // Move the objects from the tmp array back to the collection
    tmp.forEach(function (v) {
      self.push(v);
    });

    callback(null);
  });

};
