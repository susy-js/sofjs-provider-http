'use strict';

var HttpProvider = require('../index.js'); // eslint-disable-line
var TestRPC = require('sophonjs-testrpc'); // eslint-disable-line
var Sof = require('sofjs-query'); // eslint-disable-line
var SofQuery = require('sof-query');
var SusyWeb = require('susyweb');
var assert = require('chai').assert; // eslint-disable-line
var SandboxedModule = require('sandboxed-module');
var server = TestRPC.server();
server.listen(5002);

function FakeXHR2() {
  var self = this;
  self.responseText = '{}';
  self.readyState = 4;
  self.onreadystatechange = null;
  self.async = true;
  self.headers = {
    'Content-Type': 'text/plain'
  };
}

FakeXHR2.prototype.open = function (method, host) {
  // eslint-disable-line
  var self = this;
  assert.equal(method, 'POST');
  assert.notEqual(host, null);
  self.async = true;
};

FakeXHR2.prototype.setRequestHeader = function (name, value) {
  // eslint-disable-line
  var self = this;
  self.headers[name] = value;
};

FakeXHR2.prototype.send = function (payload) {
  // eslint-disable-line
  var self = this;
  var payloadParsed = JSON.parse(payload);

  if (payloadParsed.forceTimeout === true) {
    setTimeout(function () {
      self.ontimeout();
    }, 2000);
  } else if (payloadParsed.invalidSend === true) {
    throw new Error('invalid data!!!');
  } else if (payloadParsed.invalidJSON === true) {
    self.responseText = 'dsfsfd{sdf}';
    self.onreadystatechange();
  } else {
    assert.equal(typeof self.onreadystatechange, 'function');
    self.onreadystatechange();
  }
};

SandboxedModule.registerBuiltInSourceTransformer('istanbul');
var FakeHttpProvider = SandboxedModule.require('../index.js', {
  requires: {
    xhr2: FakeXHR2
  },
  singleOnly: true
});

describe('HttpProvider', function () {
  describe('constructor', function () {
    it('should throw under invalid conditions', function () {
      assert.throws(function () {
        return HttpProvider('');
      }, Error); // eslint-disable-line
      assert.throws(function () {
        return new HttpProvider({}, 3932);
      }, Error); // eslint-disable-line
    });

    it('should construct normally under valid conditions', function () {
      var provider = new HttpProvider('http://localhost:8545');
      assert.equal(provider.host, 'http://localhost:8545');
      assert.equal(provider.timeout, 0);
    });

    it('should construct normally under valid conditions', function () {
      var provider = new HttpProvider('http://localhost:8545', 10);
      assert.equal(provider.host, 'http://localhost:8545');
      assert.equal(provider.timeout, 10);
    });

    it('should construct normally under valid conditions', function () {
      var provider = new HttpProvider('http://localhost:5002', 10);
      assert.equal(provider.host, 'http://localhost:5002');
      assert.equal(provider.timeout, 10);
    });

    it('should throw error with no new', function () {
      function invalidProvider() {
        HttpProvider('http://localhost:8545', 10); // eslint-disable-line
      }
      assert.throws(invalidProvider, Error);
    });

    it('should throw error with no provider', function () {
      function invalidProvider() {
        new HttpProvider(); // eslint-disable-line
      }
      assert.throws(invalidProvider, Error);
    });
  });

  describe('test against sofjs-query', function () {
    var sof = new Sof(new HttpProvider('http://localhost:5002')); // eslint-disable-line

    it('should get accounts', function (done) {
      sof.accounts(function (accountsError, accountsResult) {
        assert.equal(accountsError, null);
        assert.equal(typeof accountsResult, 'object');
        assert.equal(Array.isArray(accountsResult), true);

        done();
      });
    });

    it('should get balances', function (done) {
      sof.accounts(function (accountsError, accountsResult) {
        assert.equal(accountsError, null);
        assert.equal(typeof accountsResult, 'object');
        assert.equal(Array.isArray(accountsResult), true);

        sof.getBalance(accountsResult[0], function (balanceError, balanceResult) {
          assert.equal(balanceError, null);
          assert.equal(typeof balanceResult, 'object');
          assert.equal(balanceResult.toNumber(10) > 0, true);

          done();
        });
      });
    });

    it('should get coinbase and balance', function (done) {
      sof.coinbase(function (accountsError, accountResult) {
        assert.equal(accountsError, null);
        assert.equal(typeof accountResult, 'string');

        sof.getBalance(accountResult, function (balanceError, balanceResult) {
          assert.equal(balanceError, null);
          assert.equal(typeof balanceResult, 'object');
          assert.equal(balanceResult.toNumber(10) > 0, true);

          done();
        });
      });
    });
  });

  describe('test against sof-query', function () {
    var query = new SofQuery(new HttpProvider('http://localhost:5002')); // eslint-disable-line

    it('should get accounts', function (done) {
      query.accounts(function (accountsError, accountsResult) {
        assert.equal(accountsError, null);
        assert.equal(typeof accountsResult, 'object');
        assert.equal(Array.isArray(accountsResult), true);

        done();
      });
    });

    it('should get balances', function (done) {
      query.accounts(function (accountsError, accountsResult) {
        assert.equal(accountsError, null);
        assert.equal(typeof accountsResult, 'object');
        assert.equal(Array.isArray(accountsResult), true);

        query.getBalance(accountsResult[0], function (balanceError, balanceResult) {
          assert.equal(balanceError, null);
          assert.equal(typeof balanceResult, 'string');

          done();
        });
      });
    });

    it('should get coinbase and balance', function (done) {
      query.coinbase(function (accountsError, accountResult) {
        assert.equal(accountsError, null);
        assert.equal(typeof accountResult, 'string');

        query.getBalance(accountResult, function (balanceError, balanceResult) {
          assert.equal(balanceError, null);
          assert.equal(typeof balanceResult, 'string');

          done();
        });
      });
    });
  });

  describe('test against susyweb', function () {
    var susyweb = new SusyWeb(new HttpProvider('http://localhost:5002')); // eslint-disable-line

    it('should get accounts', function (done) {
      susyweb.sof.getAccounts(function (accountsError, accountsResult) {
        assert.equal(accountsError, null);
        assert.equal(typeof accountsResult, 'object');
        assert.equal(Array.isArray(accountsResult), true);

        done();
      });
    });

    it('should get balances', function (done) {
      susyweb.sof.getAccounts(function (accountsError, accountsResult) {
        assert.equal(accountsError, null);
        assert.equal(typeof accountsResult, 'object');
        assert.equal(Array.isArray(accountsResult), true);

        susyweb.sof.getBalance(accountsResult[0], function (balanceError, balanceResult) {
          assert.equal(balanceError, null);
          assert.equal(typeof balanceResult, 'object');
          assert.equal(balanceResult.toNumber(10) > 0, true);

          done();
        });
      });
    });

    it('should get coinbase and balance', function (done) {
      susyweb.sof.getCoinbase(function (accountsError, accountResult) {
        assert.equal(accountsError, null);
        assert.equal(typeof accountResult, 'string');

        susyweb.sof.getBalance(accountResult, function (balanceError, balanceResult) {
          assert.equal(balanceError, null);
          assert.equal(typeof balanceResult, 'object');
          assert.equal(balanceResult.toNumber(10) > 0, true);

          done();
        });
      });
    });

    it('should close the server', function () {
      server.close();
    });
  });

  describe('susyweb FakeProvider', function () {
    describe('sendAsync timeout', function () {
      it('should send basic async request and timeout', function (done) {
        var provider = new FakeHttpProvider('http://localhost:5002', 2);

        provider.sendAsync({ forceTimeout: true }, function (err, result) {
          assert.equal(typeof err, 'string');
          assert.equal(typeof result, 'object');
          done();
        });
      });
    });

    describe('invalid payload', function () {
      it('should throw an error as its not proper json', function (done) {
        var provider = new FakeHttpProvider('http://localhost:5002');

        provider.sendAsync('sdfsds{}{df()', function (err, result) {
          assert.equal(typeof err, 'string');
          assert.equal(typeof result, 'object');
          done();
        });
      });

      it('should throw an error as its not proper json', function (done) {
        var provider = new FakeHttpProvider('http://localhost:5002');

        provider.sendAsync({ invalidSend: true }, function (err, result) {
          assert.equal(typeof err, 'string');
          assert.equal(typeof result, 'object');
          done();
        });
      });
    });

    describe('sendAsync timeout', function () {
      it('should send basic async request and timeout', function (done) {
        var provider = new FakeHttpProvider('http://localhost:5002', 2);

        provider.sendAsync({ invalidJSON: true }, function (err, result) {
          assert.equal(typeof err, 'object');
          assert.equal(typeof result, 'string');
          done();
        });
      });
    });

    describe('sendAsync', function () {
      it('should send basic async request', function (done) {
        var provider = new FakeHttpProvider('http://localhost:5002');

        provider.sendAsync({}, function (err, result) {
          assert.equal(typeof result, 'object');
          done();
        });
      });
    });
  });
});