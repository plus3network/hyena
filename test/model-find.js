var _       = require('lodash');
var Hooks   = require('../lib/hooks');
var seed    = require('./fixtures/seed');
var hyena   = require('../');
var Query   = hyena.Query;
var sinon   = require('sinon');
var expect  = require('chai').expect;
var assert  = sinon.assert;
var sandbox = sinon.sandbox.create();
require('mocha');

describe('Model', function () {
  describe('find', function () {
    var Model, spies = {};

    beforeEach(function () {
      Model = hyena.model('User');
      // Spies for all the methods
      _.forIn(Query.prototype, function (value, key) {
        spies[key] = sandbox.spy(Query.prototype, key);
      });
    });

    afterEach(function () {
      // Restore all the spies
      sandbox.restore();
    });

    it('should return a query object', function () {
      var query = Model.find();
      expect(query).to.be.instanceOf(Query);
    });

    it('should call the constructor with the alias flag', function () {
      var query = Model.find();
      expect(query.data.alias).to.equal('__users__');
    });

    it('should query.select with id', function () {
      var query = Model.find();
      assert.calledWith(spies.select, 'id');
    });

    it('should call query.select with *', function () {
      var query = Model.find();
      assert.calledWith(spies.select, '*');
    });

    it('should call select for each field', function () {
      var query = Model.find({}, 'name email');
      assert.calledWith(spies.select, 'name');
      assert.calledWith(spies.select, 'email');
    });

    it('should call query.where().equals() for an equality query', function () {
      var query = Model.find({ id: 1 });
      assert.calledWith(spies.where, 'id');
      assert.calledWith(spies.equals, 1);
    });

    it('should call query.where().in() for an array query', function () {
      var query = Model.find({ id: [1] });
      assert.calledWith(spies.where, 'id');
      assert.calledWith(spies.in, [1]);
    });

    it("should call query.limit() for options.limit", function () {
      var query = Model.find({}, null, { limit: 1});
      assert.calledWith(spies.limit, 1);
    });

    it("should call query.skip() for options.skip", function () {
      var query = Model.find({}, null, { skip: 1});
      assert.calledWith(spies.skip, 1);
    });

    it("should call query.offset() for options.offset", function () {
      var query = Model.find({}, null, { offset: 1});
      assert.calledWith(spies.offset, 1);
    });

    it("should call callback when passed", function (done) {
      var query = Model.find(function (err, docs) {
        expect(true).to.be.ok; 
        done();
      });
    });

  });
});
