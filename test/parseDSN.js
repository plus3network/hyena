var parseDSN = require('../lib/parseDSN');
var expect = require('chai').expect;
require('mocha');

describe('parseDSN', function () {

  it('should parse the protocal', function () {
    var dsn = parseDSN('mysql://localhost/example');
    expect(dsn).to.have.property('protocol', 'mysql');
  });

  it('should parse the host', function () {
    var dsn = parseDSN('mysql://localhost/example');
    expect(dsn).to.have.property('host', 'localhost');
  });

  it('should parse the port', function () {
    var dsn = parseDSN('mysql://localhost:3306/example');
    expect(dsn).to.have.property('port', 3306);
  });

  it('should parse the database', function () {
    var dsn = parseDSN('mysql://localhost/example');
    expect(dsn).to.have.property('database', 'example');
  });

  it('should parse the user', function () {
    var dsn = parseDSN('mysql://exampleUser@localhost/example');
    expect(dsn).to.have.property('user', 'exampleUser');
  });

  it('should parse the user and password', function () {
    var dsn = parseDSN('mysql://exampleUser:secret@localhost/example');
    expect(dsn).to.have.property('user', 'exampleUser');
    expect(dsn).to.have.property('password', 'secret');
  });

  it('should parse weird passwords', function () {
    var dsn = parseDSN('mysql://exampleUser:xxx`xxx-+^xxxx(xx-xxx@localhost/example');
    expect(dsn).to.have.property('protocol', 'mysql');
    expect(dsn).to.have.property('user', 'exampleUser');
    expect(dsn).to.have.property('host', 'localhost');
    expect(dsn).to.have.property('password', 'xxx`xxx-+^xxxx(xx-xxx');
    expect(dsn).to.have.property('database', 'example');
  });

  it('should parse options', function () {
    var dsn = parseDSN('mysql://exampleUser:xxx`xxx-+^xxxx(xx-xxx@localhost/example?connectionLimit=100&enc=UTF8');
    expect(dsn).to.have.property('protocol', 'mysql');
    expect(dsn).to.have.property('user', 'exampleUser');
    expect(dsn).to.have.property('host', 'localhost');
    expect(dsn).to.have.property('password', 'xxx`xxx-+^xxxx(xx-xxx');
    expect(dsn).to.have.property('database', 'example');
    expect(dsn).to.have.property('enc', 'UTF8');
    expect(dsn).to.have.property('connectionLimit', '100');
  });


});
