var hyena = require('../');
var seed = require('../test/fixtures/seed');

var User = hyena.model('User');

User.find().populate('bestFriend').exec(function (err, docs) {
  if (err) {
    console.log(err.stack);
  }
  console.log(JSON.stringify(docs));
  process.exit();
});

