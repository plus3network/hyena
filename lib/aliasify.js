var inflection = require('inflection');
module.exports = function (string, name) {
  return '__'+string.split('.').join('_')+'__';
};
