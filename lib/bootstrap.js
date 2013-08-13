var glob = require('glob');
var path = require('path');

module.exports = function (dsn, modelPath) {
  this.createConnection(dsn);
  var models = glob.sync(modelPath);
  for (var filename in models) {
    var name = path.basename(filename, path.extname(filename));
    schema = require(filename);
    this.model(name, schema); 
  }
};

