var Connection = function (dsn) {

};

Connection.prototype.query = function (sql, values, callback) {
  callback(new Error('Postgres protocol not implimented yet'));
};

module.exports = function (dsn) {
	return new Connection(dsn);	
};
