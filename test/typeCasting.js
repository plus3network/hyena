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
var Clubhouse = hyena.model('Clubhouse');
var Sponsor = hyena.model('Sponsor');
var typeCasting = require('../lib/typeCasting');
require('mocha');

describe('typeCasting', function () {

  it('should return a date', function () {
    var schema = { type: 'date' };
    expect(typeCasting('2011-01-01 00:00', schema, hyena))
      .to.be.instanceOf(Date);
    expect(typeCasting('2011-01-01 00:00', schema, hyena))
      .to.deep.equal(new Date('2011-01-01 00:00'));
  });

  it('should return a string', function () {
    var schema = { type: 'string' };
    expect(typeCasting('test', schema, hyena))
      .to.equal('test');
  });

  it('should return a null for a string', function () {
    var schema = { type: 'string' };
    expect(typeCasting(null, schema, hyena))
      .to.equal(null);
  });

  it('should return a Sponsor', function () {
    var object = { 
      name: "test",
    };
    var schema = { type: 'Sponsor' };
    expect(typeCasting(object, schema, hyena))
      .to.be.instanceOf(Sponsor);
  });

  it('should validate when a raw object is set', function (done) {
    var data = {
      cause: {
        id: 1,
        name: "Test Cause",
      },
      sponsor: {
        id: 2,
        name: "Test Sponsor",
      },
      cause_id: 1,
      sponsor_id: 2,
      is_wellness: true,
      is_public: false,
      is_open: false
    };

    var doc = new Clubhouse();
    doc.set(data);
    doc.validate(function (err) {
      expect(err).to.not.be.instanceOf(Error);
      done();
    });
  });


});

