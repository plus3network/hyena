var Query = require('../lib/query');
var assert = require('assert');
require('mocha');
var expectedSQL = "SELECT `users`.* FROM `users` WHERE `users`.`amount` IN (?,?,?)";
var expectedValues = [1,2,3];

describe('Select Query', function () {
  describe('in', function () {

    it('should generate the proper SQL using arguments', function () {
      var query = new Query({ table: 'users' });
      query
        .select()
        .where('amount')
        .in(1,2,3);
      assert.equal(expectedSQL, query.toString());
      assert.deepEqual(expectedValues, query.values());
    });

    it('should generate the proper SQL using an array', function () {
      var query = new Query({ table: 'users' });
      query
        .select()
        .where('amount')
        .in([1,2,3]);
      assert.equal(expectedSQL, query.toString());
      assert.deepEqual(expectedValues, query.values());
    });

  });
});
