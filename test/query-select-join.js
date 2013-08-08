var Query = require('../lib/query');
var assert = require('assert');
var seed = require('./fixtures/seed');
var db = seed.db;
require('mocha');

var expectedSQL = 
	"SELECT `users`.`id` AS users_id, `users`.`name` AS users_name "+
	"FROM `users` "+
	"INNER JOIN `clubhouses` ON (`clubhouses`.`id` = `users`.`clubhouse_id`) "+
	"OUTER JOIN `avatars` ON (`avatars`.`id` = `clubhouses`.`avatar_id`) "+
	"WHERE `users`.`is_public` = ? AND `clubhouses`.`type` = ?";
var expectedValues= [1,'test'];

describe('Select Query', function () {
  describe('join', function () {

    it('should generate the proper SQL', function () {
      var query = new Query(db.model('User'));

      query
        .select('name')
        .join('clubhouses', 'id')
        .on('clubhouse_id')
        .join('avatars', 'id', 'outer')
        .on('clubhouses', 'avatar_id')
        .where('is_public')
        .equals(1)
        .where('clubhouses', 'type')
        .equals('test');

      assert.equal(expectedSQL, query.toString());
      assert.deepEqual(expectedValues, query.values());
    });

  });
});
