var mysql = require('mysql');

var Connection = function (dsn) {
	this.pool = mysql.createPool(dsn); 
};

Connection.prototype.query = function (sql, values, callback) {
	var self = this;
  this.pool.getConnection(function (err, client) {
    if (err) {
      return callback(err);
    }

    if (typeof values === "function") {
      callback = values;
      values = [];
    }

    client.query(sql, values, function () {
      // this is some kung foo trickery that i swiped from the coffee script splats
      var __slice = [].slice;
      var queryargs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      client.end();
      callback.apply(null, queryargs);
    });
  });
};

module.exports = function (dsn) {
	return new Connection(dsn);	
};
