var sm = require('state-machine');

var createStateMachine = function () {
  this.state('init', { initial: true })
    .state('modified')
    .state('default')
    .event('modify', ['init','default'], 'modified')
    .event('reset', ['modified','default'], 'init')
    .event('initializeWithDefaults', 'init', 'default');
};

var PathStates = function (paths) {
  var self = this;
  this.paths = {};
  paths.forEach(function (path) {
    self.paths[path] = sm(createStateMachine);
  });
};

module.exports = PathStates;

PathStates.prototype.reset = function (path) {
  if (this.paths[path]) {
    return this.paths[path].reset();
  }
};

PathStates.prototype.default = function (path) {
  if (this.paths[path]) {
    return this.paths[path].initializeWithDefaults();
  }
};

PathStates.prototype.modify = function (path) {
  if (this.paths[path]) {
    return this.paths[path].modify();
  }
};

PathStates.prototype.each = function (callback) {
  var self = this;
  var paths = Object.keys(this.paths);
  paths.forEach(function (path) {
    callback(path, self.paths[path].currentState());
  });
};

PathStates.prototype.currentState = function (path) {
  if (this.paths[path]) {
    return this.paths[path].currentState();
  }
};

PathStates.prototype.isModified = function (path) {
  if (this.paths[path]) {
    return this.currentState(path) === 'modified';
  }
};

PathStates.prototype.isDefault = function (path) {
  if (this.paths[path]) {
    return this.currentState(path) === 'default';
  }
};

PathStates.prototype.isInit = function (path) {
  if (this.paths[path]) {
    return this.currentState(path) === 'init';
  }
};
