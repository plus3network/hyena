var Query = require('../lib/query');
var assert = require('assert');
require('mocha');

var expectedSQL = "SELECT `users`.* FROM `users` WHERE NOT `users`.`type` IS NULL ORDER BY `users`.`timestamp` ASC, `users`.`name` DESC LIMIT ? OFFSET ?";
var expectedValues = [10, 11];

describe('Select Query', function () {
  describe('order', function () {

    it('should generate the proper SQL', function () {
      var query = new Query({ table: 'users' });

      query
        .select()
        .where('type')
        .not()
        .isNull()
        .limit(10)
        .offset(11)
        .order('timestamp')
        .order('name', 'desc');

      assert.equal(expectedSQL, query.toString());
      assert.deepEqual(expectedValues, query.values());

    });

  });
});
