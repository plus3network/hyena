var Query = require('../lib/query');
var assert = require('assert');
var hyena = require('../');
var Schema = hyena.Schema;
require('mocha');

var User = hyena.model('User', new Schema({
  name: { type: 'string', required: true },
  clubhouse: { type: 'Clubhouse', field: 'causes_sponsors_id' },
  bestFriend: { type: 'User', field: 'best_friend_id' }
}));

var Clubhouse = hyena.model('Clubhouse', new Schema({
  sponsor: { type: 'Sponsor', field: 'sponsor_id' },
  cause: { type: 'Cause', field: 'cause_id' }
}), 'causes_sponsors');

var Sponsor = hyena.model('Sponsor', new Schema({
  name: { type: "string", required: true }
}));

var Cause = hyena.model('Cause', new Schema({
  name: { type: "string", required: true }
}));


var expectedSQL = 'SELECT ' 
                + '`__users__`.`id` AS __users___id, '
                + '`__users__`.`name` AS __users___name, '
                + '`__users__`.`causes_sponsors_id` AS __users___causes_sponsors_id, '
                + '`__users__`.`best_friend_id` AS __users___best_friend_id, '
                + '`__bestFriend__`.`id` AS __bestFriend___id, '
                + '`__bestFriend__`.`name` AS __bestFriend___name, '
                + '`__bestFriend__`.`causes_sponsors_id` AS __bestFriend___causes_sponsors_id, '
                + '`__bestFriend__`.`best_friend_id` AS __bestFriend___best_friend_id, '
                + '`__clubhouse__`.`id` AS __clubhouse___id, '
                + '`__clubhouse__`.`sponsor_id` AS __clubhouse___sponsor_id, '
                + '`__clubhouse__`.`cause_id` AS __clubhouse___cause_id, '
                + '`__clubhouse_sponsor__`.`id` AS __clubhouse_sponsor___id, '
                + '`__clubhouse_sponsor__`.`name` AS __clubhouse_sponsor___name '
                + 'FROM `users` AS `__users__` '
                + 'INNER JOIN `users` AS `__bestFriend__` ON (`__bestFriend__`.`id` = `__users__`.`best_friend_id`) '
                + 'INNER JOIN `causes_sponsors` AS `__clubhouse__` ON (`__clubhouse__`.`id` = `__users__`.`causes_sponsors_id`) '
                + 'INNER JOIN `sponsors` AS `__clubhouse_sponsor__` ON (`__clubhouse_sponsor__`.`id` = `__clubhouse__`.`sponsor_id`)';
var expectedValues= [];

describe('Select Query', function () {
  describe('between', function () {

    it('should generate the proper SQL', function () {
      var query = new Query(User, true);
      query
        .select('*')
        .populate('bestFriend')
        .populate('clubhouse.sponsor');
      assert.equal(expectedSQL, query.toString());
      assert.deepEqual(expectedValues, query.values());
    });

  });
});


