var Query = require('../lib/query');
var assert = require('assert');
var seed = require('./fixtures/seed');
var db = seed.db;
require('mocha');

describe('Select Query', function () {
  describe('equals', function () {
    var expectedSQL = 
      "SELECT "+
      "`__users__`.`id` AS __users___id, "+
      "`__users__`.`name` AS __users___name, "+
      "`__clubhouse__`.`id` AS __clubhouse___id, "+
      "`__clubhouse__`.`is_public` AS __clubhouse___is_public "+
      "FROM `users` AS `__users__` "+
      "INNER JOIN `causes_sponsors` AS `__clubhouse__` ON (`__clubhouse__`.`id` = `__users__`.`causes_sponsors_id`) "+
      "WHERE `__clubhouse__`.`is_public` = ? "+
      "AND `__users__`.`type` = ?";
    var expectedValues= [1,'test'];

    it('should generate the proper SQL', function () {
      var query = new Query(db.model('User'), { useAlias: true });
      query
        .select('name')
        .populate({
          path: 'clubhouse',
          select: 'is_public'
        })
        .where('clubhouse.is_public')
        .equals(1)
        .where('type')
        .equals('test');
      var sql = query.toString();
      assert.equal(expectedSQL, sql);
      assert.deepEqual(expectedValues, query.values());
    });

  });
});
