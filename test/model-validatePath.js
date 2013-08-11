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
  var doc, clubhouse, schema;

  beforeEach(function () {
    clubhouse = new Clubhouse();
    doc = new User({ clubhouse: clubhouse });
  });

  it('should return true for valid path', function () {
    expect(User.validatePath('name')).to.equal(true);
  });

  it('should return true for valid submodel', function () {
    expect(User.validatePath('clubhouse')).to.equal(true);
  });

  it('should return true for a join field', function () {
    expect(User.validatePath('causes_sponsors_id')).to.equal(true);
  });

  it('should return false for in-valid path', function () {
    expect(User.validatePath('partner')).equal(false);
  });

  it('should return true for valid sub path', function () {
    expect(User.validatePath('clubhouse.is_public')).to.equal(true);
  });

  it('should return true for valid subpath.subpath', function () {
    expect(User.validatePath('clubhouse.sponsor.name')).to.equal(true);
  });

});
