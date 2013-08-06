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
});

var clubhouseSchema = new Schema({
  cause: { type: 'Cause', field: 'cause_id', required: true },
  sponsor: { type: 'Sponsor', field: 'sponsor_id', required: true },
  is_wellness: { type: 'boolean', default: false },
  is_public: { type: 'boolean', default: true },
  is_open: { type: 'boolean', default: false }
});

var sponsorSchema = new Schema({
  name: { type: 'string', required: true },
  logo: { type: 'url', default: 'http://example.com/logo.png' }
});

sponsorSchema.pre('save', function (doc, next) {
  console.log('Pre Save', this.name);
  next();
});

sponsorSchema.post('init', function (doc, next) {
  console.log('Post Init', this.name);
  next();
});

var causeSchema = new Schema({
  name: { type: 'string', required: true },
  logo: { type: 'url', default: 'http://example.com/logo.png' }
});

var User = hyena.model('User', userSchema);
var Clubhouse = hyena.model('Clubhouse', clubhouseSchema, 'causes_sponsors');
var Sponsor = hyena.model('Sponsor', sponsorSchema);
var Cause = hyena.model('Cause', causeSchema);

var sponsor = new Sponsor();
sponsor.name = 'Test Sponsor';

var cause = new Cause({ name: 'Test Cause' });
var clubhouse = new Clubhouse({ cause: cause, sponsor: sponsor });
var user = new User({ name: 'Jon Doe', email: 'jon.doe@example.com', clubhouse: clubhouse });

async.auto({
  cause: function (callback) {
    cause.save(callback); 
  },
  sponsor: function (callback) {
    sponsor.save(callback);
  },
  clubhouse: ['cause', 'sponsor', function (callback, results) {
    clubhouse.save(callback);
  }],
  user: ['clubhouse', function (callback, results) {
    user.save(callback);
  }]
}, function (err, results) {
  if (err) {
    console.log(err.stack);
    console.log(err.errors);
  }
  console.log('done');
  process.exit();
});

