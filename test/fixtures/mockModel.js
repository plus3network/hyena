module.exports = {
	table: 'users',
	db: { 
		model: function (name) { 
			return this.models[name];
		},
		models: {

		},
		connection: {
			query: function (sql, values, callback) {
				callback(null, []);	
			} 
		}
	}
};
