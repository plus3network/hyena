var glob = require('glob');
var path = require('path');
var _ = require('lodash');

module.exports = function (dsn, modelPath) {
  this.createConnection(dsn);
  var models = glob.sync(modelPath);
  var self = this;
  models.forEach(function (filename) {
    var name = path.basename(filename, path.extname(filename));
    schema = require(filename);
    self.model(name, schema); 
  });
};
