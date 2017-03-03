var Query = require('../lib/query');
var assert = require('assert');
var seed = require('./fixtures/seed');
var db = seed.db;
require('mocha');

describe('Select Query', function () {
  describe('regexp', function () {
    var expectedSQL = 
      "SELECT "+
      "`users`.`id` AS users_id, "+
      "`users`.`name` AS users_name "+
      "FROM `users` "+
      "WHERE `users`.`name` REGEXP ?";
    var expectedValues= ['.*[Ss]mith.*'];

    it('should generate the proper SQL', function () {
      var query = new Query(db.model('User'));
      var regex = new RegExp('.*[Ss]mith.*');
      query
        .select('name')
        .where('name')
        .regex(regex);
      var sql = query.toString();
      assert.equal(expectedSQL, sql);
      assert.deepEqual(expectedValues, query.values());
    });

  });
});

