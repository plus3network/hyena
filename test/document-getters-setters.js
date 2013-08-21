var seed       = require('./fixtures/seed');
var hyena      = require('../');
var Schema     = hyena.Schema;
var Model      = hyena.Model;
var Document   = hyena.Document;
var sinon      = require('sinon');
var expect     = require('chai').expect;
var assert     = sinon.assert;
var sandbox    = sinon.sandbox.create();
var Faker      = require('Faker');
var User       = hyena.model('User');
var inflection = require('inflection');
var Clubhouse  = hyena.model('Clubhouse');
require('mocha');

describe('Document getters/setters', function () {
  var doc;

  beforeEach(function () {
    doc = new User();
  });

  it('should should read a value from the attributes', function () {
    doc.attributes.name = 'Some Name';
    expect(doc.name).to.equal('Some Name');
    expect(doc.get('name')).to.equal('Some Name');
  });

  it('should set an attribute via direct', function () {
    expect(doc.attributes.name).to.equal(undefined);
    doc.name = 'Some Name';
    expect(doc.attributes.name).to.equal('Some Name');
  });

  it('should set an attribute via set', function () {
    expect(doc.attributes.name).to.equal(undefined);
    doc.set('name', 'Some Name');
    expect(doc.attributes.name).to.equal('Some Name');
  });

  it('should set the field for a relationship via direct', function () {
    var clubhouse = new Clubhouse({ id: 123 });
    doc.clubhouse = clubhouse;
    expect(doc.get('causes_sponsors_id')).to.equal(123);
  });

  it('should set the field for a relationship via set', function () {
    var clubhouse = new Clubhouse({ id: 123 });
    doc.set('clubhouse', clubhouse);
    expect(doc.get('causes_sponsors_id')).to.equal(123);
  });

  it('should set the releatinship field after the fact', function () {
    var clubhouse = new Clubhouse();
    doc.set('clubhouse', clubhouse);
    expect(doc.get('causes_sponsors_id')).to.equal(undefined);
    clubhouse.id = 123;
    clubhouse.emit('save', clubhouse);
    expect(doc.get('causes_sponsors_id')).to.equal(123);
  });

  it('should allow you to set a custom getter', function () {
     var testSchema = new Schema({
       name: { type: 'string', get: function (v) {
         return v + ' is the greatest!';
       }}
      });

      var TestModel = Model.generate('TestModel', 'users', testSchema, hyena);

      var doc = new TestModel({ name: "John" });
      expect(doc.name).to.equal('John is the greatest!');

  });

  it('should allow you to set a custom setter', function () {
     var testSchema = new Schema({
       name: { type: 'string', set: function (v) {
         return inflection.capitalize(v);
       }}
      });

      var TestModel = Model.generate('TestModel', 'users', testSchema, hyena);

      var doc = new TestModel({ name: "john" });
      expect(doc.attributes.name).to.equal('John');

  });

});
