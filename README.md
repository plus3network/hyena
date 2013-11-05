Hyena
=====

A Node.js Mongoose like ORM for MySQL

[ ![Codeship Status for plus3network/hyena](https://www.codeship.io/projects/230b87c0-27ff-0131-e0d9-2a84b7e12546/status?branch=master)](https://www.codeship.io/projects/9023) [![Build Status](https://travis-ci.org/plus3network/hyena.png?branch=master)](https://travis-ci.org/plus3network/hyena)

## Install

```
npm install hyena 
```

## Example

Better documentation to follow...

```javascript
var hyena = require('hyena');
var connection = require('hyena/lib/mysql');
var Schema = hyena.Schema;

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
  // Do something fabulous here.
});

```

## Why The Name?

Hyena's are the closest relative to the Mongoose even though they look very different.
SO when using this library keep that in mind. While this library is very similar
to Mongoose it's also very different.


## License

The MIT License (MIT)

Copyright (c) 2013 plus3network

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
