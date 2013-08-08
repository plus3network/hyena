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
require('mocha');

describe('Document init', function () {
  var doc;
  
  beforeEach(function () {
    doc = new User({ name: Faker.Name.findName() }); 
  });

  it('should mark the document as new if an id is not supplied', function () {
    expect(doc).to.have.property('isNew', true);
  });

  it('should mark the document as new if an id is not supplied', function () {
    var user = new User({ id: 1, name: Faker.Name.findName() });
    expect(user).to.have.property('isNew', false);
  });

  it('should set doc.attributes.name when doc.name is set', function () {
    doc.name = 'Susan Smith';
    expect(doc).to.have.deep.property('attributes.name', 'Susan Smith');
  });

  it('should set doc.attributes.best_friend_id to bestFriend.id', function () {
    var bestFriend = new User({ id: 2, name: Faker.Name.findName() });
    doc.bestFriend = bestFriend;
    expect(doc).to.have.deep.property('attributes.best_friend_id', 2);
  });

  it('should set doc.attributes.best_friend_id to bestFriend.id via hydrate', function () {
    var bestFriend = new User({ id: 2, name: Faker.Name.findName() });
    var user = new User({ id: 1, name: Faker.Name.findName(), bestFriend: bestFriend });
    expect(user).to.have.deep.property('attributes.best_friend_id', 2);
  });

  it('should set doc.attributes.best_friend_id to bestFriend.id when bestFriend emits save', function () {
    var bestFriend = new User({ name: Faker.Name.findName() });
    doc.bestFriend = bestFriend;
    bestFriend.id = 2;
    bestFriend.emit('save', bestFriend);
    expect(doc).to.have.deep.property('attributes.best_friend_id', 2);
  });

});
