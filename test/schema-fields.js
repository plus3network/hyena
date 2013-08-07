var Schema = require('../lib/schema');
var Hooks = require('../lib/hooks');
var expect = require('chai').expect;
require('mocha');

describe('Schema', function () {
  describe('fields', function () {
    var model;

    beforeEach(function () {
      model = new Schema({
        name: { type: 'string' },
        user: { type: 'User', field: 'user_id'}
      });
    });

    it('should contain name', function () {
      var fields = model.fields();
      expect(fields).to.include('name');
    });

    it('should contain user_id', function () {
      var fields = model.fields();
      expect(fields).to.include('user_id');
    });


  });
});
