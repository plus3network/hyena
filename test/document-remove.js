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

describe('Document remove', function () {
  
  var doc;

  beforeEach(function (done) {
    seed.clear(function () {
      seed.create(function () {
        doc = new User({ 
          name: Faker.Name.findName(), 
          email: Faker.Internet.email()
        });
        doc.save(done);
      });
    });
  });

  it('should remove the document from the database', function (done) {
    doc.remove(function (err) {
      User.findById(doc.id, function (err, doc) {
        expect(doc).to.be.null;
        done();
      });
    });
  });

  it('should run remove middleware', function (done) {
    var preStub = sinon.stub();
    var postStub = sinon.stub();

    preStub.callsArg(1);
    postStub.callsArg(1);

    doc.pre('remove', preStub);
    doc.post('remove', postStub);

    doc.remove(function () {
      assert.called(preStub);
      assert.called(postStub);
      done();
    });
  });


});
