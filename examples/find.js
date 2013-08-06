var hyena = require('../');
var connection = require('../lib/mysql');
var Schema = hyena.Schema;
var async = require('async');

hyena.connect(connection({
  user: "example",
  password: "example",
  database: "example"
}));

var userSchema = new Schema({
  name: { type: 'string', required: true },
  email: { type: 'email', requried: true },
  clubhouse: { type: 'Clubhouse', field: 'causes_sponsors_id', required: true },
  bestFriend: { type: 'User', field: 'best_friend_id' }
});

var clubhouseSchema = new Schema({
  cause: { type: 'Cause', field: 'cause_id', required: true },
  sponsor: { type: 'Sponsor', field: 'sponsor_id', required: true },
  is_wellness: { type: 'boolean', default: false },
  is_public: { type: 'boolean', default: true },
  is_open: { type: 'boolean', default: false },
  author: { type: 'User', field: 'user_id' }
});

var sponsorSchema = new Schema({
  name: { type: 'string', required: true },
  logo: { type: 'url', default: 'http://example.com/logo.png' }
});

var causeSchema = new Schema({
  name: { type: 'string', required: true },
  logo: { type: 'url', default: 'http://example.com/logo.png' }
});

var User = hyena.model('User', userSchema);
var Clubhouse = hyena.model('Clubhouse', clubhouseSchema, 'causes_sponsors');
var Sponsor = hyena.model('Sponsor', sponsorSchema);
var Cause = hyena.model('Cause', causeSchema);

User.find().populate('clubhouse').exec(function (err, docs) {
  if (err) {
    console.log(err.stack);
  }
  console.log(JSON.stringify(docs));
  process.exit();
});

