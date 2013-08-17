var Query = require('../lib/query');
var assert = require('assert');
var seed = require('./fixtures/seed');
var hyena = require('../');
require('mocha');

var expectedSQL = 'INSERT INTO `users` '
                + 'SET '
								+ '`users`.`name` = ?, '
								+ '`users`.`email` = ?, '
								+ '`users`.`causes_sponsors_id` = ?, '
								+ '`users`.`privacy` = ?, '
								+ '`users`.`best_friend_id` = ?, '
								+ '`users`.`id` = ? '
								+ 'ON DUPLICATE KEY UPDATE '
								+ '`users`.`name` = ?, '
								+ '`users`.`email` = ?, '
								+ '`users`.`causes_sponsors_id` = ?, '
								+ '`users`.`privacy` = ?, '
								+ '`users`.`best_friend_id` = ?';
var expectedValues= ['Joe Doe', 'joe.doe@example.com', 1, 'public', 2, 1, 'Joe Doe', 'joe.doe@example.com', 1, 'public', 2];

var doc = { name: "Joe Doe", email: 'joe.doe@example.com', causes_sponsors_id: 1, best_friend_id: 2, id: 1, privacy: 'public' };

describe('Query', function () {
  describe('upsert', function () {

    it('should generate the proper SQL', function () {
      var query = new Query(hyena.model('User'));
      query
				.upsert(doc);
      assert.equal(expectedSQL, query.toString());
      var values = query.values();
      assert.deepEqual(expectedValues, values);
    });

  });
});
