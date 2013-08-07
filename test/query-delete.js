var Query = require('../lib/query');
var assert = require('assert');
require('mocha');

var expectedSQL = 'DELETE FROM `users` '
                + 'WHERE `users`.`id` = ?';
var expectedValues= [1];

describe('Query', function () {
  describe('delete', function () {

    it('should generate the proper SQL', function () {
      var query = new Query({ table: 'users' });
      query
				.delete().where('id').equals(1);
      assert.equal(expectedSQL, query.toString());
      assert.deepEqual(expectedValues, query.values());
    });

  });
});
