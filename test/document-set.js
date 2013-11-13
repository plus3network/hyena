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
require('mocha');

describe('Document set', function () {
  var doc, clubhouse;

  beforeEach(function () {
    clubhouse = new Clubhouse();
    doc = new User({ clubhouse: clubhouse });
  });

  it('should set attribute', function () {
    var name = Faker.Name.findName();
    doc.set('name', name);
    expect(doc.attributes['name']).to.equal(name);
  });
  
  it('should set attribute on a child object via path', function () {
    doc.set('clubhouse.is_open', true);
    expect(doc.attributes['clubhouse'].is_open).to.equal(true);
  });

  it('should convert the value on the fly', function () {
    doc.set('clubhouse.is_open', 1);
    expect(doc.attributes['clubhouse'].is_open).to.equal(1);
    doc.set('clubhouse.is_open', 1, Boolean);
    expect(doc.attributes['clubhouse'].is_open).to.equal(true);
  });

  it('should throw an error when setting an adhoc attribute', function () {
    var name = Faker.Name.findName();
    expect(function () {
      doc.set('foo', name);
    }).to.throw(Error);
  });

  it('should set a field using an object', function () {
    var name = Faker.Name.findName();
    doc.set({ name: name });
    expect(doc.attributes['name']).to.equal(name);
  });

  it('should set a field as null', function () {
    doc.set({ name: null });
    expect(doc.attributes['name']).to.be.null;
  });

});
  
