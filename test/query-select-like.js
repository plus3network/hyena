var Query = require('../lib/query');
var assert = require('assert');
require('mocha');

var expectedSQL = "SELECT `users`.* FROM `users` WHERE `users`.`type` LIKE ?";
var expectedValues = ['%tes%'];

describe('Select Query', function () {
  describe('like', function () {

    it('should generate the proper SQL', function () {
      var query = new Query({ table: 'users' });
      query
        .select()
        .where('type')
        .like('%tes%');
      assert.equal(expectedSQL, query.toString());
      assert.deepEqual(expectedValues, query.values());
    });

  });
});
