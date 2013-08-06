var Query = require('../lib/query');
var assert = require('assert');
require('mocha');

var expectedSQL = "SELECT `users`.* FROM `users` WHERE `users`.`amount` BETWEEN ? AND ?";
var expectedValues= [0,10];

describe('Select Query', function () {
  describe('between', function () {

    it('should generate the proper SQL', function () {
      var query = new Query({ table: 'users' });
      query
        .select()
        .where('amount')
        .between(0, 10);
      assert.equal(expectedSQL, query.toString());
      assert.deepEqual(expectedValues, query.values());
    });

  });
});


