var _        = require('lodash');
var Hooks    = require('../lib/hooks');
var seed     = require('./fixtures/seed');
var hyena    = require('../');
var Query    = hyena.Query;
var Document = hyena.Document;
var sinon    = require('sinon');
var expect   = require('chai').expect;
var assert   = sinon.assert;
var sandbox  = sinon.sandbox.create();
var Model    = hyena.model('User');
require('mocha');

describe('Document', function () {
  describe('selected', function () {

    before(function (done) {
      seed.clear(function () {
        seed.create(done);
      });
    });

    it('should populate selected', function (done) {
      var query = Model.findById(1).exec(function (err, doc) {
        expect(doc.selected).to.be.ok;
        expect(Object.keys(doc.selected)).to.be.length(5);
        done();
      });
    });

    it('should only set name to selected', function (done) {
      var query = Model.findById(1).select('name').exec(function (err, doc) {
        expect(doc.isSelected('name')).to.equal(true);
        expect(doc.isSelected('email')).to.equal(false);
        expect(doc.isSelected('causes_sponsors_id')).to.equal(false);
        expect(doc.isSelected('best_friend_id')).to.equal(false);
        done();
      });
    });

    it('should check child fields', function (done) {
      var query = Model.findById(1)
        .select('name')
        .populate({ path: 'bestFriend', select: 'name' })
        .exec(function (err, doc) {
          expect(doc.isSelected('name')).to.equal(true);
          expect(doc.isSelected('email')).to.equal(false);
          expect(doc.isSelected('causes_sponsors_id')).to.equal(false);
          expect(doc.isSelected('best_friend_id')).to.equal(false);
          expect(doc.isSelected('bestFriend.name')).to.equal(true);
          expect(doc.isSelected('bestFriend.email')).to.equal(false);
          expect(doc.isSelected('bestFriend.causes_sponsors_id')).to.equal(false);
          expect(doc.isSelected('bestFriend.best_friend_id')).to.equal(false);
          done();
        });
    });


  });
});
