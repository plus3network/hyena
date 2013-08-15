var Schema = require('../lib/schema');
var Hooks = require('../lib/hooks');
var expect = require('chai').expect;
require('mocha');

describe('Schema', function () {
  describe('init schema', function () {
    var schema, model;

    beforeEach(function () {
      schema = new Schema({
        name: { type: 'string' },
        user: { type: 'User', field: 'user_id'}
      });
      model = schema.model('user','activities');
    });

    it('should have valid model', function () {
      expect(model).to.have.property('type', 'User');
      expect(model).to.have.property('table', 'activities');
      expect(model).to.have.property('field', 'user_id');
    });

  });
});
