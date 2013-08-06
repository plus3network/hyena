var Query = require('../lib/query');
var assert = require('assert');
require('mocha');
var expectedSQL = 
  "SELECT "+
  "`clubhouses`.`id` AS clubhouses_id, "+
  "`users`.`email` AS users_email "+
  "FROM `users` "+
  "INNER JOIN `clubhouses` ON (`clubhouses`.`id` = `users`.`clubhouse_id`) "+
  "WHERE NOT `users`.`type` IS NULL";
var expectedValues = [];

describe('Select Query', function () {
  describe('fields', function () {

    it('should generate the proper SQL', function () {
      var query = new Query({ table: 'users' });
      query
        .select('clubhouses', 'id')
        .select('users', 'email')
        .join('clubhouses', 'id')
        .on('clubhouse_id')
        .where('type')
        .not()
        .isNull();
      assert.equal(expectedSQL, query.toString());
      assert.deepEqual(expectedValues, query.values());
    });

  });
});
