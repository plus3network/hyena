var seed = require('./fixtures/seed');
var Collection = require('../lib/collection');
var User = seed.db.model('User');
var expect = require('chai').expect;
require('mocha');

describe('Collection', function() {

  beforeEach(function (done) {
    seed.clear(function () {
      seed.create(function () {
        seed.db.connection.query('TRUNCATE TABLE `friends`', done);
      });
    });
  });

  it('should instance of an array and collection', function(done) {
    User.findById(1, function (err, doc) {
      doc.populate('friends', function (err, doc) {
        var def = User.schema.model('friends');
        var col = new Collection('friends', def, doc, []);
        expect(col).to.be.instanceof(Collection);
        expect(col).to.be.instanceof(Array);
        done();
      });
    }); 
  });

  it('should add an instance', function(done) {
    User.findById(3, function (err, doc) {
      doc.populate('friends', function (err, doc) {
        var def = User.schema.model('friends');
        var col = new Collection('friends', def, doc, []);
        var friend = new User({ id: 1 });
        col.add(friend, { status: 'APPROVE' }, function (err, doc) {
          expect(doc.friends).to.have.length(1);
          expect(doc.friends[0].id).to.equal(1);
          done();
        });
      });
    }); 
  });

  it('should remove instance', function(done) {
    User.findById(3, function (err, doc) {
      doc.populate('friends', function (err, doc) {
        var def = User.schema.model('friends');
        var col = new Collection('friends', def, doc, []);
        var friend = new User({ id: 1 });
        col.add(friend, function (err, doc) {
          col.remove(1, function (err) {
            expect(doc.friends).to.have.length(0);
            done();
          });
        });
      });
    }); 
  });

});
