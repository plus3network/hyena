var url = require('url');
module.exports = function (string) {
  var dsn = {};
  
  var matches = string.match(/([^:]+):\/\/(([^:]+)(:([^@]+))?@)?([^\/:]+)(:([^\/]+))?\/(.+)/);

  if (matches[1]) dsn.protocol = matches[1];
  if (matches[3]) dsn.user     = matches[3];
  if (matches[5]) dsn.password = matches[5];
  if (matches[6]) dsn.host     = matches[6];
  if (matches[8]) dsn.port     = parseInt(matches[8], 10);
  if (matches[9]) dsn.database = matches[9];

  return dsn;

};
