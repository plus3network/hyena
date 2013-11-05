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

describe('Model.getType', function () {
  var doc, clubhouse, schema;

  beforeEach(function () {
    clubhouse = new Clubhouse();
    doc = new User({ clubhouse: clubhouse });
  });

  it('should return a model name', function () {
    expect(User.getType('clubhouse')).to.have.property('type').to.equal('Clubhouse');
  });

  it('should return array', function () {
    expect(User.getType('friends')).to.have.property('type').to.equal('join');
  });


});

