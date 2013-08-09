var url = require('url');
module.exports = function (string) {
  var dsn = {};
  var urlParts = url.parse(string);
  dsn.protocol = urlParts.protocol.replace(/:/, '');
  if (urlParts.auth) {
    dsn.user = urlParts.auth.split(':')[0];
    dsn.password = urlParts.auth.split(':')[1];
  }
  dsn.host = urlParts.hostname;
  dsn.database = urlParts.pathname.replace(/\//, '');
  if (urlParts.port) dsn.port = parseInt(urlParts.port, 10); 
  return dsn;
};
