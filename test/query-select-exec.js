
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
  describe('exec', function () {
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

    it('should return an array of docs', function (done) {
      query.populate('bestFriend').exec(function (err, docs) {
        expect(docs).to.be.instanceOf(Array);
        expect(docs).to.have.length(5);
        expect(docs[0]).to.be.instanceOf(Model);
        expect(docs[0]).to.have.property('bestFriend').to.be.instanceOf(Model);
        done();
      });
    });

    it('should return a doc', function (done) {
      query.option('returnOne', true).populate('bestFriend').exec(function (err, doc) {
        expect(doc).to.not.be.instanceOf(Array);
        expect(doc).to.be.instanceOf(Model);
        expect(doc).to.have.property('bestFriend').to.be.instanceOf(Model);
        done();
      });
    });

  });
});
