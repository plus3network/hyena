var Query = require('../lib/query');
var assert = require('assert');
require('mocha');

var expectedSQL = 'INSERT INTO `users` '
                + 'SET '
								+ '`users`.`name` = ?, '
								+ '`users`.`email` = ?, '
								+ '`users`.`id` = ? '
								+ 'ON DUPLICATE KEY UPDATE '
								+ '`users`.`name` = ?, '
								+ '`users`.`email` = ?';
var expectedValues= ['Joe Doe', 'joe.doe@example.com', 1, 'Joe Doe', 'joe.doe@example.com'];
var doc = { name: "Joe Doe", email: "joe.doe@example.com", id: 1 };

describe('Query', function () {
  describe('upsert', function () {

    it('should generate the proper SQL', function () {
      var query = new Query({ table: 'users' });
      query
				.upsert(doc);
      assert.equal(expectedSQL, query.toString());
      assert.deepEqual(expectedValues, query.values());
    });

  });
});
