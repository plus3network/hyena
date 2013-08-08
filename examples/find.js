var hyena = require('../');
var seed = require('../test/fixtures/seed');

var User = hyena.model('User');

User.find()
.select('name')
.populate({ path: 'bestFriend', select: 'name' })
.exec(function (err, docs) {
  if (err) {
    console.log(err.stack);
  }
  console.log(docs);
  process.exit();
});

