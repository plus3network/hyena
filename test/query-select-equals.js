var Query = require('../lib/query');
var assert = require('assert');
require('mocha');

var expectedSQL = "SELECT `users`.* FROM `users` WHERE `users`.`is_public` = ? AND `users`.`type` = ?";
var expectedValues= [1,'test'];

describe('Select Query', function () {
  describe('equals', function () {

    it('should generate the proper SQL', function () {
      var query = new Query({ table: 'users' });
      query
        .select()
        .where('is_public')
        .equals(1)
        .where('type')
        .equals('test');
      assert.equal(expectedSQL, query.toString());
      assert.deepEqual(expectedValues, query.values());
    });

  });
});
