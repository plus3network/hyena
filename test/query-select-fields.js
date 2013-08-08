var Query = require('../lib/query');
var assert = require('assert');
var seed = require('./fixtures/seed');
var db = seed.db;
require('mocha');

describe('Select Query', function () {
  describe('fields', function () {


    it('should generate the proper SQL simple select', function () {
			var expectedSQL = 
				"SELECT "+
				"`users`.`id` AS users_id, "+
				"`users`.`name` AS users_name, "+
				"`users`.`email` AS users_email "+
				"FROM `users`";
      var query = new Query(db.model('User'));
      query
				.select('name email');
      assert.equal(expectedSQL, query.toString());
    });

    it('should generate the proper SQL populates', function () {
			var expectedSQL = 
				"SELECT "+
				"`__users__`.`id` AS __users___id, "+
				"`__users__`.`name` AS __users___name, "+
				"`__users__`.`email` AS __users___email, "+
				"`__bestFriend__`.`id` AS __bestFriend___id, "+
				"`__bestFriend__`.`name` AS __bestFriend___name "+
				"FROM `users` AS `__users__` "+
				"INNER JOIN `users` AS `__bestFriend__` ON (`__bestFriend__`.`id` = `__users__`.`best_friend_id`)";
      var query = new Query(db.model('User'), { useAlias: true });
      query
				.select('name email')
				.populate({
					path: 'bestFriend',
					select: "name"
				});
			var string = query.toString();
      assert.equal(expectedSQL, string);
    });

  });
});
