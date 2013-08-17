var Query = require('../lib/query');
var assert = require('assert');
var seed = require('./fixtures/seed');
var hyena = require('../');
var Schema = hyena.Schema;
require('mocha');


var expectedSQL = 'SELECT ' 
                + '`__users__`.`id` AS __users___id, '
                + '`__users__`.`name` AS __users___name, '
                + '`__users__`.`email` AS __users___email, '
                + '`__users__`.`causes_sponsors_id` AS __users___causes_sponsors_id, '
                + '`__users__`.`privacy` AS __users___privacy, '
                + '`__users__`.`best_friend_id` AS __users___best_friend_id, '
                + '`__bestFriend__`.`id` AS __bestFriend___id, '
                + '`__bestFriend__`.`name` AS __bestFriend___name, '
                + '`__clubhouse__`.`id` AS __clubhouse___id, '
                + '`__clubhouse__`.`sponsor_id` AS __clubhouse___sponsor_id, '
                + '`__clubhouse__`.`cause_id` AS __clubhouse___cause_id, '
                + '`__clubhouse__`.`is_wellness` AS __clubhouse___is_wellness, '
                + '`__clubhouse__`.`is_public` AS __clubhouse___is_public, '
                + '`__clubhouse__`.`is_open` AS __clubhouse___is_open, '
                + '`__clubhouse_sponsor__`.`id` AS __clubhouse_sponsor___id, '
                + '`__clubhouse_sponsor__`.`name` AS __clubhouse_sponsor___name, '
                + '`__clubhouse_sponsor__`.`logo` AS __clubhouse_sponsor___logo '
                + 'FROM `users` AS `__users__` '
                + 'INNER JOIN `users` AS `__bestFriend__` ON (`__bestFriend__`.`id` = `__users__`.`best_friend_id` AND `__bestFriend__`.`is_active` = ?) '
                + 'INNER JOIN `causes_sponsors` AS `__clubhouse__` ON (`__clubhouse__`.`id` = `__users__`.`causes_sponsors_id`) '
                + 'INNER JOIN `sponsors` AS `__clubhouse_sponsor__` ON (`__clubhouse_sponsor__`.`id` = `__clubhouse__`.`sponsor_id`) '
                + 'WHERE `__users__`.`is_active` = ?';
var expectedValues= [1, 2];

describe('Select Query', function () {
  describe('between', function () {

    it('should generate the proper SQL alt interface', function () {
      var query = new Query(hyena.model('User'), { useAlias: true });
      query
        .populate({
          path: 'bestFriend',
          select: 'name',
          match: { is_active: 1 }
        })
        .populate('clubhouse.sponsor')
        .where('is_active').equals(2);
      var sql = query.toString();
      assert.equal(expectedSQL, sql); 
      assert.deepEqual(expectedValues, query.values());
    });

  });
});


