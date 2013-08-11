var _        = require('lodash');
var seed     = require('./fixtures/seed');
var hyena    = require('../');
var Document = hyena.Document;
var sinon    = require('sinon');
var expect   = require('chai').expect;
var assert   = sinon.assert;
var sandbox  = sinon.sandbox.create();
var Faker    = require('Faker');
var Cause = hyena.model('Cause');
var Clubhouse = hyena.model('Clubhouse');
require('mocha');

describe('Document hydrate', function () {
  var doc;
  
  beforeEach(function () {
    doc = new Cause({ name: 'Test Cause' }); 
  });

  it('should set all paths to init', function () {
    expect(doc.isInit('name')).to.equal(true);
    expect(doc.isInit('logo')).to.equal(true);
  });

  it('should set the path to modified set directly', function () {
    doc.name = "Something Else";
    expect(doc.isModified('name')).to.equal(true);
  });
  
  it('should set the path to modified set via set', function () {
    doc.set('name', 'Something Else');
    expect(doc.isModified('name')).to.equal(true);
  });

  it('should return modified paths', function () {
    doc.set('name', 'Something Else');
    var modified = doc.modifiedPaths();
    expect(modified).to.deep.equal(['name']);
  });

  it('should mark a path modified', function () {
    doc.markModified('name');
    expect(doc.isModified('name')).to.equal(true);
  });
  
  describe('child', function () {
    var parent, child;

    beforeEach(function () {
      child = new Cause({ name: 'Test Cause' });
      parent = new Clubhouse({ cause: child });
    });

    it('should get the state of a child via the parent', function () {
      parent.set('cause.name', 'Something Else');
      expect(child.isModified('name')).to.equal(true);
      expect(parent.isModified('cause.name')).to.equal(true);
    });

    it('should modify the state of a child via markModified', function () {
      parent.markModified('cause.name');
      expect(child.isModified('name')).to.equal(true);
      expect(parent.isModified('cause.name')).to.equal(true);
    });

    it('should childs modified paths in the modifiedPaths', function () {
      parent.markModified('cause.name');
      var modified = parent.modifiedPaths();
      expect(modified).to.deep.equal(['cause.name']);
    });

    it('should have isDirectModified', function () {
      parent.markModified('cause.name');
      expect(parent.isDirectModified('cause.name')).to.equal(true);
      expect(parent.isDirectModified('cause')).to.equal(false);
    });

  });

});
