var Seedling = require('seedling');
var Faker    = require('Faker');
var async    = require('async');
var _        = require('lodash');
var hyena    = require('../../');
var Schema   = hyena.Schema;

var mysql_user = process.env.MYSQL_USER || 'travis';
if (process.env.MYSQL_PASSWORD)  mysql_user += ':' + process.env.MYSQL_PASSWORD;

hyena.createConnection('mysql://'+mysql_user+'@localhost/hyena_test');

hyena.on('error', function (err) {
  console.log('Hyena:', err.stack);
});

var User = hyena.model('User', new Schema({
  name: { type: 'string', required: true },
  email: { type: 'email', require: true },
  clubhouse: { type: 'Clubhouse', field: 'causes_sponsors_id' },
  privacy: { type: 'string', default: 'public' },
  bestFriend: { type: 'User', field: 'best_friend_id' },
  friends: { type: 'join', schema: { 
    type: "User", 
    through: 'friends', 
    field: 'user_id', 
    foreign_key: 'friend_id', 
    match: { status: 'APPROVE'} 
  }},
  bestFriendsOf: { type: 'join', schema: { 
    type: "User", 
    foreign_key: "best_friend_id" 
  }}
}));

var Clubhouse = hyena.model('Clubhouse', new Schema({
  sponsor: { type: 'Sponsor', field: 'sponsor_id' },
  cause: { type: 'Cause', field: 'cause_id' },
  is_wellness: { type: 'boolean', default: false },
  is_public: { type: 'boolean', default: true },
  is_open: { type: 'boolean', default: false }
}), 'causes_sponsors');

var Sponsor = hyena.model('Sponsor', new Schema({
  name: { type: "string", required: true },
  logo: { type: 'url', default: 'http://example.com/logo.png' }
}));

var Cause = hyena.model('Cause', new Schema({
  name: { type: "string", required: true },
  logo: { type: 'url', default: 'http://example.com/logo.png' }
}));

var seedData = {
  Cause: function () {
    var create = function () {
      return {
        name: Faker.Company.companyName()
      };
    };
    return _.range(5).map(create);
  },

  Sponsor: function () {
    var create = function () {
      return {
        name: Faker.Company.companyName()
      };
    };
    return _.range(5).map(create);
  }
};

var seed = module.exports = new Seedling(hyena, seedData);

seed.post('create', function (next) {
  var model = hyena.model('Clubhouse');
  var create = function () {
    var doc = {
      sponsor: seed.embed('Sponsor'),
      cause: seed.embed('Cause')
    };
    return new model(doc);
  };
  var docs = _.range(5).map(create);
  seed.collection['Clubhouse'] = docs;
  async.each(docs, function (doc, callback) {
    doc.save(callback);
  }, next);

});

seed.post('create', function (next) {
  var model = hyena.model('User');
  var create = function () {
    return new model({
        name: Faker.Name.findName(),
        email: Faker.Internet.email(),
        clubhouse: seed.embed('Clubhouse')
    });
  };
  var docs = _.range(5).map(create);
  async.each(docs, function (doc, callback) {
    doc.save(callback);
  }, function (err) {
    seed.collection.User = docs;
    next();
  });

});

seed.post("create", function (next) {
  async.each(seed.collection.User, function (doc, callback) {
    doc.best_friend_id = (doc.id === 1)? 2 : 1;
    doc.privacy = (doc.id === 4)? 'friends' : 'public';
    doc.save(callback);
  }, next);
});

