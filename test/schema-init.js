var Schema = require('../lib/schema');
var Hooks = require('../lib/hooks');
var assert = require('assert');
require('mocha');

describe('Schema', function () {
  describe('init schema', function () {
    var model;

    beforeEach(function () {
      model = new Schema({});
    });

    it('should return an object', function () {
      assert.ok(typeof(model) === 'object');
    });

    it('should return an instance of Schema', function () {
      assert.ok(model instanceof Schema);
    });

    it('should return an instance of Hooks', function () {
      assert.ok(model instanceof Hooks);
    });

  });
});
