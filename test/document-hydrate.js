var _        = require('lodash');
var seed     = require('./fixtures/seed');
var hyena    = require('../');
var Document = hyena.Document;
var sinon    = require('sinon');
var expect   = require('chai').expect;
var assert   = sinon.assert;
var sandbox  = sinon.sandbox.create();
var Faker    = require('Faker');
var Model = hyena.model('Cause');
require('mocha');

describe('Document hydrate', function () {
  var doc;
  
  beforeEach(function () {
    doc = new Model(); 
  });

  it('should set defaults if they exist in the schema', function () {
    expect(doc).to.have.property('logo', 'http://example.com/logo.png');
  });


});
