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

describe('Document', function () {
  describe('toObject', function () {

    var doc, testSchema, TestModel;

    beforeEach(function () {
     testSchema = new Schema({
        name: { type: 'string', required: true, get: function (v) {
          return v + " is awesome!";
        }},
        birthday: { type: 'date' }
      });

      testSchema.virtual('under_13').get(function () {
        return moment().subtract('years', 13).toDate() < this.birthday;
      });

      TestModel = Model.generate('TestModel', 'users', testSchema, hyena);

      doc = new TestModel({
        name: Faker.Name.findName(), 
        birthday: moment().subtract('years', 12).toDate()
      });
    });

    it('should return a plain js object', function() {
      var obj = doc.toObject();
      expect(obj).to.not.equal(doc);
      expect(obj.constructor.name).to.equal('Object');
    });

    it('should set virtuals', function () {
      var obj = doc.toObject({ virtuals: true });
      expect(obj).to.have.property('under_13', true);
    });

    it('should set getters', function () {
      var obj = doc.toObject({ getters: true });
      expect(obj).to.have.property('name', doc.attributes.name+' is awesome!');
    });

    it('should use the schema options', function () {
      testSchema.set('toObject', { getters: true }); 
      var obj = doc.toObject();
      expect(obj).to.have.property('name', doc.attributes.name+' is awesome!');
    });

    it('should use the overide schema options', function () {
      testSchema.set('toObject', { getters: true }); 
      var obj = doc.toObject({ getters: false });
      expect(obj).to.have.property('name', doc.attributes.name);
    });

  });
});
