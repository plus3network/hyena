var Query = require('../lib/query');
var assert = require('assert');
var seed = require('./fixtures/seed');
var db = seed.db;
require('mocha');

var expectedSQL = "SELECT `users`.`id` AS users_id, `users`.`name` AS users_name FROM `users` WHERE NOT `users`.`type` IS NULL LIMIT ? OFFSET ?";
var expectedValues = [10, 11];

describe('Select Query', function () {
  describe('limit and offset', function () {

    it('should generate the proper SQL', function () {

      var query = new Query(db.model('User'));
      query
        .select('name')
        .where('type')
        .not()
        .isNull()
        .limit(10)
        .offset(11);

      assert.equal(expectedSQL, query.toString());
      assert.deepEqual(expectedValues, query.values());
    });

  });
});
