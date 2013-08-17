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
                + 'INNER JOIN `causes_sponsors` AS `__clubhouse__` ON (`__clubhouse__`.`id` = `__users__`.`causes_sponsors_id`) '
                + 'INNER JOIN `sponsors` AS `__clubhouse_sponsor__` ON (`__clubhouse_sponsor__`.`id` = `__clubhouse__`.`sponsor_id`) '
                + 'ORDER BY `__clubhouse_sponsor__`.`name` DESC, `__users__`.`name` ASC';
var expectedValues= [];

describe('Select Query', function () {
  describe('sort', function () {

    it('should generate the proper SQL string sort', function () {
      var query = new Query(hyena.model('User'), { useAlias: true });
      query
        .populate('clubhouse.sponsor')
        .sort('-clubhouse.sponsor.name name');
      var string = query.toString();
      assert.equal(expectedSQL, string);
      assert.deepEqual(expectedValues, query.values());
    });

    it('should generate the proper SQL object sort', function () {
      var query = new Query(hyena.model('User'), { useAlias: true });
      query
        .populate('clubhouse.sponsor')
        .sort({ 'clubhouse.sponsor.name': -1, 'name': 1 });
      var string = query.toString();
      assert.equal(expectedSQL, string);
      assert.deepEqual(expectedValues, query.values());
    });

    it('should generate the proper SQL object sort', function () {
      var query = new Query(hyena.model('User'), { useAlias: true });
      query
        .populate('clubhouse.sponsor')
        .sort({ 'clubhouse.sponsor.name': -1, 'name': 'asc' });
      var string = query.toString();
      assert.equal(expectedSQL, string);
      assert.deepEqual(expectedValues, query.values());
    });

  });
});


