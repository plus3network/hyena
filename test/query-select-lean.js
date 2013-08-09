var _        = require('lodash');
var Hooks    = require('../lib/hooks');
var seed     = require('./fixtures/seed');
var hyena    = require('../');
var Query    = hyena.Query;
var sinon    = require('sinon');
var expect   = require('chai').expect;
var assert   = sinon.assert;
var sandbox  = sinon.sandbox.create();
require('mocha');

describe('Query', function () {
  describe('lean', function () {
    var Model, query;

    before(function (done) {
      seed.clear(function () {
        seed.create(done);
      });
    });

    beforeEach(function () {
      Model = hyena.model('User');
      query = new Query(Model, { useAlias: true });
    });

    it('should not return an array of docs of model', function (done) {
      query.lean().populate('bestFriend').exec(function (err, docs) {
        expect(docs).to.be.instanceOf(Array);
        expect(docs).to.have.length(5);
        expect(docs[0]).to.not.be.instanceOf(Model);
        expect(docs[0]).to.have.property('bestFriend').to.not.be.instanceOf(Model);
        done();
      });
    });

    it('should not return a doc of model', function (done) {
      query.lean().populate('bestFriend').option('returnOne', true).exec(function (err, doc) {
        expect(doc).to.not.be.instanceOf(Array);
        expect(doc).to.not.be.instanceOf(Model);
        expect(doc).to.have.property('bestFriend').to.not.be.instanceOf(Model);
        done();
      });
    });

  });
});
