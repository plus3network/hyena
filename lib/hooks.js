var async = require('async');
var _ = require('lodash');

function Hooks () {
  this.pres = {};
  this.posts = {};
}

var createMiddlewareMethod = function (type) {
  return function (event, fn) {
    if(!this[type][event]) {
      this[type][event] = [];
    }
    this[type][event].push(fn);
    return this;
  };
};

Hooks.prototype.pre = createMiddlewareMethod('pres');
Hooks.prototype.post = createMiddlewareMethod('posts'); 

var createMiddlwareRunner = function (type) {
  return function (event, args, done) {
    var self = this;
    if (!this[type][event] || this[type][event].length === 0) return done();
    var run = function (fn, callback) {
      fn.apply(self, _.union(args, [callback]));
    };
    async.forEachSeries(this[type][event], run, done);
    return this;
  };
};

Hooks.prototype.runPre = createMiddlwareRunner('pres');
Hooks.prototype.runPost = createMiddlwareRunner('posts');

module.exports = Hooks;
