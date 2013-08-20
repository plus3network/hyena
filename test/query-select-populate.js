var Query = require('../lib/query');
var assert = require('assert');
var seed = require('./fixtures/seed');
var hyena = require('../');
var Schema = hyena.Schema;
require('mocha');

var expectedSQL = 'SELECT ' 
                + '`__parent__`.`id` AS __parent___id, '
                + '`__parent__`.`name` AS __parent___name, '
                + '`__parent__`.`email` AS __parent___email, '
                + '`__parent__`.`causes_sponsors_id` AS __parent___causes_sponsors_id, '
                + '`__parent__`.`privacy` AS __parent___privacy, '
                + '`__parent__`.`best_friend_id` AS __parent___best_friend_id, '
                + '`__bestFriend__`.`id` AS __bestFriend___id, '
                + '`__bestFriend__`.`name` AS __bestFriend___name, '
                + '`__bestFriend__`.`email` AS __bestFriend___email, '
                + '`__bestFriend__`.`causes_sponsors_id` AS __bestFriend___causes_sponsors_id, '
                + '`__bestFriend__`.`privacy` AS __bestFriend___privacy, '
                + '`__bestFriend__`.`best_friend_id` AS __bestFriend___best_friend_id, '
                + '`__clubhouse__`.`id` AS __clubhouse___id, '
                + '`__clubhouse__`.`sponsor_id` AS __clubhouse___sponsor_id, '
                + '`__clubhouse__`.`cause_id` AS __clubhouse___cause_id, '
                + '`__clubhouse__`.`is_wellness` AS __clubhouse___is_wellness, '
                + '`__clubhouse__`.`is_public` AS __clubhouse___is_public, '
                + '`__clubhouse__`.`is_open` AS __clubhouse___is_open, '
                + '`__clubhouse_sponsor__`.`id` AS __clubhouse_sponsor___id, '
                + '`__clubhouse_sponsor__`.`name` AS __clubhouse_sponsor___name, '
                + '`__clubhouse_sponsor__`.`logo` AS __clubhouse_sponsor___logo '
                + 'FROM `users` AS `__parent__` '
                + 'INNER JOIN `users` AS `__bestFriend__` ON (`__bestFriend__`.`id` = `__parent__`.`best_friend_id`) '
                + 'INNER JOIN `causes_sponsors` AS `__clubhouse__` ON (`__clubhouse__`.`id` = `__parent__`.`causes_sponsors_id`) '
                + 'INNER JOIN `sponsors` AS `__clubhouse_sponsor__` ON (`__clubhouse_sponsor__`.`id` = `__clubhouse__`.`sponsor_id`)';
var expectedValues= [];

describe('Select Query', function () {
  describe('populate', function () {

    it('should generate the proper SQL', function () {
      var query = new Query(hyena.model('User'), { useAlias: true });
      query
        .populate('bestFriend')
        .populate('clubhouse.sponsor');
      var string = query.toString();
      assert.equal(expectedSQL, string);
      assert.deepEqual(expectedValues, query.values());
    });

    it('should generate the proper SQL', function () {
      var query = new Query(hyena.model('User'), { useAlias: true });
      query
        .populate('bestFriend clubhouse.sponsor');
      var string = query.toString();
      assert.equal(expectedSQL, string);
      assert.deepEqual(expectedValues, query.values());
    });

  });
});

