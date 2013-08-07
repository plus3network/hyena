var seed = require('../test/fixtures/seed');
seed.clear(function () {
  seed.create(function () {
    console.log('done');
    process.exit();
  });
});

