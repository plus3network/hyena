var PathStates = require('../lib/path_states');
var expect = require('chai').expect;
require('mocha');

describe("PathState", function () {
  var states;
  beforeEach(function () {
    states = new PathStates(['name', 'clubhouse']);
  });

  it('should start out as initalized', function () {
    states.each(function (path, state) {
      expect(state).to.equal('init');
    });
  });

  it('should move to default', function () {
    states.default('name');
    expect(states.currentState('name')).to.equal('default');
  });

  it('should be modified initalized', function () {
    states.default('name');
    states.each(function (path, state) {
      states.modify(path);
      expect(states.isModified(path)).to.equal(true);
    });
  });

  it('should move to modified', function () {
    states.modify('name');
    expect(states.currentState('name')).to.equal('modified');
  });

  it('should reset', function () {
    states.each(function (path) {
      states.modify(path);
      expect(states.isModified(path)).to.equal(true);
      states.reset(path);
      expect(states.isInit(path)).to.equal(true);
    });
  });

  it('should return true for isModified()', function () {
    states.modify('name');
    expect(states.isModified('name')).to.equal(true);
  });

  it('should return true for isDefault()', function () {
    states.default('name');
    expect(states.isDefault('name')).to.equal(true);
  });

  it('should return true for isDefault()', function () {
    expect(states.isInit('name')).to.equal(true);
  });

});
