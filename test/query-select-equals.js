var Query = require('../lib/query');
var assert = require('assert');
var seed = require('./fixtures/seed');
var db = seed.db;
require('mocha');

describe('Select Query', function () {
  describe('equals', function () {
    var expectedSQL = "SELECT `users`.`id` AS users_id, `users`.`name` AS users_name FROM `users` WHERE `users`.`is_public` = ? AND `users`.`type` = ?";
    var expectedValues= [1,'test'];

    it('should generate the proper SQL', function () {
      var query = new Query(db.model('User'));
      query
        .select('name')
        .where('is_public')
        .equals(1)
        .where('type')
        .equals('test');
      assert.equal(expectedSQL, query.toString());
      assert.deepEqual(expectedValues, query.values());
    });

  });
});
