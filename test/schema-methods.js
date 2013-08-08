var seed = require('./fixtures/seed');
var hyena = seed.db;
var Schema = hyena.Schema;
var Model = hyena.Model;
var expect = require('chai').expect;
var sinon = require('sinon');
var Faker = require('Faker');
var assert = sinon.assert;
require('mocha');

var testSchema = new Schema({
  name: { type: 'string', required: true },
  best_friend_id: { type: 'number' }
});

testSchema.methods.findFriends = function (callback) {
  var User = this.db.model('User');
  User.find({ id: this.best_friend_id }, callback);
};

var TestModel = Model.generate('TestModel', 'users', testSchema, hyena);

var doc = new TestModel({ name: Faker.Name.findName(), best_friend_id: 1 });

describe('Schema', function () {
  describe('methods', function () {

    beforeEach(function (done) {
      seed.clear(function () {
        seed.create(done);
      });
    });

    it('should have a method called findFriends', function () {
      expect(doc).to.have.property('findFriends');
    });

    it('should call the method', function (done) {
      doc.findFriends(function (err, docs) {
        expect(docs).to.be.instanceOf(Array);
        done();
      });
    });

  });
});
