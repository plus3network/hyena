var mysql = require('mysql');

var Connection = function (dsn) {
	this.pool = mysql.createPool(dsn);
};

Connection.prototype.query = function (sql, values, callback) {
	var self = this;
  this.pool.getConnection(function (err, client) {
    if (err) {
      console.log(err.stack);
      if (callback) return callback(err);
      return;
    }

    if (typeof values === "function") {
      callback = values;
      values = [];
    }

    client.query(sql, values, function () {
      // this is some kung foo trickery that i swiped from the coffee script splats
      var __slice = [].slice;
      var queryargs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      client.release();
      callback.apply(null, queryargs);
    });
  });
};

module.exports = function (dsn, options, callback) {
  callback = callback || function () { };
	var conn = new Connection(dsn);	
  callback(null, conn);
  return conn;
};
