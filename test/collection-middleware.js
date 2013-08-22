var seed = require('./fixtures/seed');
var Collection = require('../lib/collection');
var User = seed.db.model('User');
var expect = require('chai').expect;
var sinon = require('sinon');
require('mocha');

describe('Collection', function() {

  beforeEach(function (done) {
    seed.clear(function () {
      seed.create(function () {
        seed.db.connection.query('TRUNCATE TABLE `friends`', done);
      });
    });
  });

  it('should call pre add:friends', function(done) {
    User.findById(3, function (err, doc) {
      doc.populate('friends', function (err, doc) {
        var def = User.schema.model('friends');
        var col = new Collection('friends', def, doc, []);
        var friend = new User({ id: 1 });
        var stub = new sinon.stub();
        stub.callsArg(1);
        doc.pre('add:friends', stub);
        col.add(friend, { status: 'APPROVE' }, function (err, doc) {
          expect(doc.friends).to.have.length(1);
          expect(doc.friends[0].id).to.equal(1);
          sinon.assert.called(stub);
          done();
        });
      });
    }); 
  });

  it('should call post add:friends', function(done) {
    User.findById(3, function (err, doc) {
      doc.populate('friends', function (err, doc) {
        var def = User.schema.model('friends');
        var col = new Collection('friends', def, doc, []);
        var friend = new User({ id: 1 });
        var stub = new sinon.stub();
        stub.callsArg(1);
        doc.post('add:friends', stub);
        col.add(friend, { status: 'APPROVE' }, function (err, doc) {
          expect(doc.friends).to.have.length(1);
          expect(doc.friends[0].id).to.equal(1);
          sinon.assert.called(stub);
          done();
        });
      });
    }); 
  });

  it('should call pre remove:friends', function(done) {
    User.findById(3, function (err, doc) {
      doc.populate('friends', function (err, doc) {
        var def = User.schema.model('friends');
        var col = new Collection('friends', def, doc, []);
        var friend = new User({ id: 1 });
        var stub = new sinon.stub();
        stub.callsArg(1);
        doc.pre('remove:friends', stub);
        col.add(friend, { status: 'APPROVE' }, function (err, doc) {
          expect(doc.friends).to.have.length(1);
          expect(doc.friends[0].id).to.equal(1);
          col.remove(friend.id, function (err) {
            sinon.assert.called(stub);
            done();
          });
        });
      });
    }); 
  });

  it('should call post remove:friends', function(done) {
    User.findById(3, function (err, doc) {
      doc.populate('friends', function (err, doc) {
        var def = User.schema.model('friends');
        var col = new Collection('friends', def, doc, []);
        var friend = new User({ id: 1 });
        var stub = new sinon.stub();
        stub.callsArg(1);
        doc.post('remove:friends', stub);
        col.add(friend, { status: 'APPROVE' }, function (err, doc) {
          expect(doc.friends).to.have.length(1);
          expect(doc.friends[0].id).to.equal(1);
          col.remove(friend.id, function (err) {
            sinon.assert.called(stub);
            done();
          });
        });
      });
    }); 
  });

});
