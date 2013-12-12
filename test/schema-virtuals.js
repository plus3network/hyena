var seed = require('./fixtures/seed');
var hyena = seed.db;
var Schema = hyena.Schema;
var Model = hyena.Model;
var expect = require('chai').expect;
var sinon = require('sinon');
var Faker = require('Faker');
var assert = sinon.assert;
var moment = require('moment');
require('mocha');



describe('Schema', function () {
  describe('virtuals', function () {

    var testSchema, TestModel;

    beforeEach(function () {
     testSchema = new Schema({
        first_name: { type: 'string', required: true },
        last_name: { type: 'string', required: true },
        birthday: { type: 'date' }
      });

      TestModel = Model.generate('TestModel', 'users', testSchema, hyena);
    });

    it('should allow you to set a virtual getter on a path (via direct)', function () {
      testSchema.virtual('under_13').get(function () {
        return moment().subtract('years', 13).toDate() < this.birthday;
      });
      var doc = new TestModel({ first_name: Faker.Name.firstName(), last_name: Faker.Name.lastName(), birthday: moment().subtract('years', 12).toDate() });
      expect(doc.under_13).to.equal(true);
    });

    it('should allow you to set a virtual getter on a path (via get)', function () {
      testSchema.virtual('under_13').get(function () {
        return moment().subtract('years', 13).toDate() < this.birthday;
      });
      var doc = new TestModel({  birthday: moment().subtract('years', 12).toDate() });
      expect(doc.get('under_13')).to.equal(true);
    });

    it('should allow you to set a virtual setter on a path (via direct)', function () {
      testSchema.virtual('name').set(function (value) {
        var parts = value.split(' ');
        this.first_name = parts[0];
        this.last_name = parts[1];
      });
      var doc = new TestModel();
      doc.name = "First Last";
      expect(doc.first_name).to.equal('First');
      expect(doc.last_name).to.equal('Last');
    });

    it('should allow you to set a virtual setter on a path (via set)', function () {
      testSchema.virtual('name').set(function (value) {
        var parts = value.split(' ');
        this.first_name = parts[0];
        this.last_name = parts[1];
      });
      var doc = new TestModel();
      doc.set('name', 'First Last');
      expect(doc.first_name).to.equal('First');
      expect(doc.last_name).to.equal('Last');
    });

    it('should allow you to set a virtual setter and getter', function () {
      testSchema.virtual('name').set(function (value) {
        var parts = value.split(' ');
        this.first_name = parts[0];
        this.last_name = parts[1];
      });
      testSchema.virtual('name').get(function () {
        return this.first_name + ' ' + this.last_name;
      });
      var doc = new TestModel();
      doc.set('name', 'First Last');
      expect(doc.first_name).to.equal('First');
      expect(doc.last_name).to.equal('Last');
      expect(doc).to.have.property('name', 'First Last');

    });

  });
});
