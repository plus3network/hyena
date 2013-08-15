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
        var query = "INSERT INTO `friends` VALUES (1,2), (1,3), (1,4), (1,5)";
        conn.query(query, done);
      });
    });
  });

  afterEach(function (done) {
    var conn = hyena.connection;
    var query = "TRUNCATE TABLE `friends`";
    conn.query(query, done);
  });

  it('should populate a document', function (done) {
    User.findById(1, function (err, doc) {
      User.populate(doc, 'bestFriend', function (err, doc) {
        expect(doc).to.have.property('bestFriend').to.be.instanceof(User);
        done();
      });
    });
  });

  it('should populate an array documents', function (done) {
    User.find().exec(function (err, docs) {
      User.populate(docs, 'bestFriend', function (err, docs) {
        expect(docs).to.be.instanceof(Array);
        expect(docs).to.have.length(5);
        docs.forEach(function (doc) {
          expect(doc).to.have.property('bestFriend').to.be.instanceof(User);
        });
        done();
      });
    });
  });


});

