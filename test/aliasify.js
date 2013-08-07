var aliasify = require('../lib/aliasify');
var assert = require('assert');
require('mocha');

describe('aliasify', function () {
  it('should convert periods to underscores and add __ on each end', function () {
    assert.equal(aliasify('test.foo.bar'), '__test_foo_bar__');
  });
});
