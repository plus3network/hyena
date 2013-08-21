var Query = require('../lib/query');
var assert = require('assert');
var seed = require('./fixtures/seed');
var db = seed.db;
require('mocha');

describe('Select Query', function () {
  describe('equals', function () {
    var expectedSQL = 
      "SELECT "+
      "`__parent__`.`id` AS __parent___id, "+
      "`__parent__`.`name` AS __parent___name, "+
      "`__clubhouse__`.`id` AS __clubhouse___id, "+
      "`__clubhouse__`.`is_public` AS __clubhouse___is_public "+
      "FROM `users` AS `__parent__` "+
      "INNER JOIN `causes_sponsors` AS `__clubhouse__` ON (`__clubhouse__`.`id` = `__parent__`.`causes_sponsors_id`) "+
      "WHERE `__clubhouse__`.`is_public` = ? "+
      "AND `__clubhouse__`.`is_open` = ? "+
      "AND `__clubhouse__`.`is_wellness` = ? "+
      "AND `__parent__`.`type` = ?";
    var expectedValues= [1, false, true, 'test'];

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
        .where('clubhouse.is_open')
        .equals(false)
        .where('clubhouse.is_wellness')
        .equals(true)
        .where('type')
        .equals('test');
      var sql = query.toString();
      assert.equal(expectedSQL, sql);
      assert.deepEqual(expectedValues, query.values());
    });

  });
});
