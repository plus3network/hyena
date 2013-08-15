var Schema = require('../lib/schema');
var Hooks = require('../lib/hooks');
var expect = require('chai').expect;
require('mocha');

describe('Schema', function () {
  describe('init schema', function () {
    var schema, models;

    beforeEach(function () {
      schema = new Schema({
        name: { type: 'string' },
        user: { type: 'User', field: 'user_id'}
      });
      models = schema.models('activities');
    });

    it('should have user in models', function () {
      expect(models).to.have.property('user');
      expect(models).to.have.deep.property('user.type', 'User');
      expect(models).to.have.deep.property('user.table', 'activities');
      expect(models).to.have.deep.property('user.field', 'user_id');
    });

  });
});
