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
require('mocha');

describe('Document populate', function () {
  
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

  describe('one to one', function () {

    it('should populate a field', function(done) {
      User.findById(1, function (err, doc) {
        doc.populate('clubhouse.sponsor', function (err, doc) {
          expect(doc.clubhouse).to.have.property('id');
          expect(doc.clubhouse).to.have.property('cause_id');
          expect(doc.clubhouse).to.have.property('sponsor');
          expect(doc.clubhouse.sponsor).to.have.property('name');
          expect(doc.clubhouse).to.have.property('is_wellness');
          expect(doc.clubhouse).to.have.property('is_public');
          expect(doc.clubhouse).to.have.property('is_open');
          done();
        });
      });
    });

    it('should select name populate a sub field', function(done) {
      User.findById(1, function (err, doc) {
        doc.populate({ path: 'clubhouse.sponsor', select: 'logo' }, function (err, doc) {
          expect(doc.clubhouse).to.have.property('id');
          expect(doc.clubhouse).to.have.property('cause_id');
          expect(doc.clubhouse).to.have.property('sponsor');
          expect(doc.clubhouse.sponsor).to.not.have.property('name');
          expect(doc.clubhouse).to.have.property('is_wellness');
          expect(doc.clubhouse).to.have.property('is_public');
          expect(doc.clubhouse).to.have.property('is_open');
          done();
        });
      });
    });

    it('should select name populate a field', function(done) {
      User.findById(1, function (err, doc) {
        doc.populate({ path: 'bestFriend', select: 'name' }, function (err, doc) {
          expect(doc.bestFriend).to.have.property('id');
          expect(doc.bestFriend).to.have.property('name');
          expect(doc.bestFriend).to.not.have.property('email');
          done();
        });
      });
    });

    it('should  populate a deep field', function(done) {
      User.findById(1, function (err, doc) {
        doc.populate({ path: 'bestFriend.bestFriend.bestFriend' }, function (err, doc) {
          expect(doc.bestFriend).to.have.property('bestFriend');
          expect(doc.bestFriend.bestFriend).to.have.property('bestFriend');
          done();
        });
      });
    });

  });

  describe('one to many', function () {
  
    it('should populate bestFriendsOf', function(done) {
      User.findById(1, function (err, doc) {
        doc.populate('bestFriendsOf', function (err, doc) {
          expect(doc).to.have.property('bestFriendsOf').to.be.instanceof(Array);
          expect(doc).to.have.property('bestFriendsOf').to.have.length(4);
          doc.bestFriendsOf.forEach(function (friend) {
            expect(friend).to.have.property('best_friend_id', doc.id);
          });
          done();
        });
      });
    });

    it('should populate bestFriendsOf', function(done) {
      User.findById(1, function (err, doc) {
        doc.populate({ path: 'bestFriendsOf', select: "name" }, function (err, doc) {
          expect(doc).to.have.property('bestFriendsOf').to.be.instanceof(Array);
          expect(doc).to.have.property('bestFriendsOf').to.have.length(4);
          doc.bestFriendsOf.forEach(function (friend) {
            expect(friend).to.have.property('name');
            expect(friend).to.not.have.property('email');
          });
          done();
        });
      });
    });

    it('should populate bestFriendsOf friends', function(done) {
      User.findById(1, function (err, doc) {
        doc.populate({ 
          path: 'bestFriendsOf',
          select: "name",
          match: { privacy: 'friends' }
        }, function (err, doc) {
          expect(doc).to.have.property('bestFriendsOf').to.be.instanceof(Array);
          expect(doc).to.have.property('bestFriendsOf').to.have.length(1);
          doc.bestFriendsOf.forEach(function (friend) {
            expect(friend).to.have.property('name');
            expect(friend).to.not.have.property('email');
          });
          done();
        });
      });
    });

  });

  describe('many to many', function () {

    it('should popuate friends with 3 friends', function(done) {
      User.findById(1, function (err, doc) {
        doc.populate('friends', function (err, doc) {
          expect(doc.friends).to.have.length(3);
          doc.friends.forEach(function (friend) {
            expect(friend).to.have.property('id');
            expect(friend).to.have.property('name');
            expect(friend).to.have.property('email');
            expect(friend).to.have.property('causes_sponsors_id');
            expect(friend).to.have.property('best_friend_id');
          });
          done();
        });
      });
    });

    it('should select fields', function(done) {
      User.findById(1, function (err, doc) {
        doc.populate({
          path: 'friends',
          select: 'name'
        }, function (err, doc) {
          expect(doc.friends).to.have.length(3);
          doc.friends.forEach(function (friend) {
            expect(friend).to.have.property('id');
            expect(friend).to.have.property('name');
            expect(friend).to.not.have.property('email');
            expect(friend).to.not.have.property('causes_sponsors_id');
            expect(friend).to.not.have.property('best_friend_id');
          });
          done();
        });
      });
    });

    it('should select fields with 1 match', function(done) {
      User.findById(1, function (err, doc) {
        doc.populate({
          path: 'friends',
          select: 'name',
          match: { status: 'PENDING' }
        }, function (err, doc) {
          expect(doc.friends).to.have.length(1);
          doc.friends.forEach(function (friend) {
            expect(friend).to.have.property('id');
            expect(friend).to.have.property('name');
            expect(friend).to.not.have.property('email');
            expect(friend).to.not.have.property('causes_sponsors_id');
            expect(friend).to.not.have.property('best_friend_id');
          });
          done();
        });
      });
    });

  });


});

