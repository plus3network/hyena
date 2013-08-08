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
        done();
      });
    });
  });

  it('should set the id', function (done) {
    expect(doc).to.have.property('id', null);
    doc.save(function (err) {
      expect(doc).to.have.property('id').to.be.a('number');
      done();
    });
  });

  it('should set the id to 6', function (done) {
    expect(doc).to.have.property('id', null);
    doc.save(function (err) {
      expect(doc).to.have.property('id', 6);
      done();
    });
  });

  it('should emit save event', function (done) {
    doc.on('save', function (o) {
      done();
    });
    doc.save();
  });

  it('should run save middleware', function (done) {
    var preStub = sinon.stub();
    var postStub = sinon.stub();

    preStub.callsArg(1);
    postStub.callsArg(1);

    doc.pre('save', preStub);
    doc.post('save', postStub);

    doc.save(function () {
      assert.called(preStub);
      assert.called(postStub);
      done();
    });
  });

});

