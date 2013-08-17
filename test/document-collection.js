var _        = require('lodash');
var seed     = require('./fixtures/seed');
var hyena    = require('../');
var Document = hyena.Document;
var sinon    = require('sinon');
var expect   = require('chai').expect;
var assert   = sinon.assert;
var sandbox  = sinon.sandbox.create();
var Faker    = require('Faker');
var User     = hyena.model('User');
var Collection = require('../lib/collection');
require('mocha');

describe('Document collection', function () {
  
  beforeEach(function (done) {
    seed.clear(function () {
      seed.create(function () {
        var conn = hyena.connection;
        var query = "INSERT INTO `friends` VALUES (1,2,'APPROVE'), (1,3,'APPROVE'), (1,4,'APPROVE'), (1,5,'PENDING')";
        conn.query(query, done);
      });
    });
  });

  afterEach(function (done) {
    var conn = hyena.connection;
    var query = "TRUNCATE TABLE `friends`";
    conn.query(query, done);
  });


  it('should popuate friends with 3 friends', function(done) {
    User.findById(1, function (err, doc) {
      doc.populate('friends', function (err, doc) {
        expect(doc).to.have.property('friends').to.have.length(3);
       done();
      });
    });
  });

  it('should have property friends instance of Collection', function(done) {
    User.findById(1, function (err, doc) {
      doc.populate('friends', function (err, doc) {
        expect(doc).to.have.property('friends').to.be.instanceof(Collection);
        done();
      });
    });
  });

  it('should have property friends instance of Collection', function(done) {
    var doc = new User({ id: 1 });
    var friend = new User({ id: 3 });
    var additionalFields = { status: 'APPROVE' };
    friend.friends.add(doc, additionalFields, function (err) {
      expect(friend.friends).to.have.length(1);
      expect(friend.friends[0].id).to.equal(1);
      done();
    });
  });

  it('should add additonal fields', function(done) {
    var doc = new User({ id: 1 });
    var friend = new User({ id: 3 });
    friend.friends.add(doc, function (err) {
      expect(friend.friends).to.have.length(0);
      done();
    });
  });

});

