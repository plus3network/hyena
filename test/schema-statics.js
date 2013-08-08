var seed = require('./fixtures/seed');
var hyena = seed.db;
var Schema = hyena.Schema;
var Model = hyena.Model;
var expect = require('chai').expect;
var sinon = require('sinon');
var assert = sinon.assert;
require('mocha');

var testSchema = new Schema({
  name: { type: 'string', required: true }
});

testSchema.statics.findByBestFriends = function (id, callback) {
  var User = this.db.model('User');
  return User.find({ best_friend_id: id }, callback);
};

var TestModel = Model.generate('TestModel', 'users', testSchema, hyena);

describe('Schema', function () {
  describe('statics', function () {

    beforeEach(function (done) {
      seed.clear(function () {
        seed.create(done);
      });
    });

    it('should have findByBestFriends method', function () {
      expect(TestModel).to.have.property('findByBestFriends');
    });

    it('should call the hyena.model method', function (done) {
      TestModel.findByBestFriends(1, function (err, docs) { 
        expect(docs).to.be.instanceOf(Array);
        done();
      });
    });

  });
});
