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
				"`__parent__`.`id` AS __parent___id, "+
				"`__parent__`.`name` AS __parent___name, "+
				"`__parent__`.`email` AS __parent___email, "+
				"`__bestFriend__`.`id` AS __bestFriend___id, "+
				"`__bestFriend__`.`name` AS __bestFriend___name "+
				"FROM `users` AS `__parent__` "+
				"INNER JOIN `users` AS `__bestFriend__` ON (`__bestFriend__`.`id` = `__parent__`.`best_friend_id`)";
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
