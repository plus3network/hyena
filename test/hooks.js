var util = require('util');
var Hooks = require('../lib/hooks');
var assert = require('assert');
require('mocha');

function Test () {
  Hooks.call(this);
}
util.inherits(Test, Hooks);

var capitalize = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

var runTestFor = function (type) {
  describe(type, function () {
    var myObj;

    beforeEach(function () {
      myObj = new Test();
    });

    it('should allow me to add a '+type, function () {
      var fn = function (next) { next(); };
      myObj[type]('test', fn);
      assert.equal(fn, myObj[type+'s']['test'][0]);
    });

    it('should call '+type, function (done) {
      var ran = false;
      var fn = function (arg, next) { 
        ran = true;
        next();
      };
      myObj[type]('test', fn);
      myObj['run'+capitalize(type)]('test', ['my arg'], function (err, results) {
        assert.ok(ran);
        done();
      });
    });

    it('should call '+type+' with arguments', function (done) {
      var fn = function (arg, next) { 
        assert.equal(arg, 'my arg');
        next();
      };
      myObj[type]('test', fn);
      myObj['run'+capitalize(type)]('test', ['my arg'], done);
    });

    it('should call '+type+' scoped to object', function (done) {
      var fn = function (next) { 
        assert.equal(this, myObj);
        next();
      };
      myObj[type]('test', fn);
      myObj['run'+capitalize(type)]('test', [], done);
    });

  });
};

describe('Hooks', function () {
  runTestFor('pre');
  runTestFor('post');
});
