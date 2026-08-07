const {test} = require('node:test');
const util = require('../loader/util.js');
const mock = require('mock-require');

const interopRequire = util.interopRequire;

test('obj is not a string, __esModule=false', t => {
  var result = interopRequire({__esModule: false, a: 1});
  t.assert.deepStrictEqual(result, {__esModule: false, a: 1});
});

test('obj is not a string, __esModule=true', t => {
  var result = interopRequire({__esModule: true, a: 1});
  t.assert.strictEqual(result, undefined);
});

test('obj is string, not safe require, module not found', t => {
  t.assert.throws(() => {
    interopRequire('../a', false);
  }, Error);
});

test('obj is string, not safe require', t => {
  mock('../a', {__esModule: false, a: 1});
  var result = interopRequire('../a', false);
  t.assert.deepStrictEqual(result, {__esModule: false, a: 1});
});

test('obj is string, not safe require, __esModule=true', t => {
  mock('../a', {__esModule: true, default: 'default'});
  var result = interopRequire('../a', false);
  t.assert.deepStrictEqual(result, 'default');
});

test('obj is string, safe require module not found', t => {
  var result = interopRequire('../a-not-found', true);
  t.assert.deepStrictEqual(result, null);
});

test('obj is string, safe require', t => {
  mock('../a', {__esModule: false, a: 1});
  var result = interopRequire('../a', true);
  t.assert.deepStrictEqual(result, {__esModule: false, a: 1});
});

test('obj is string, safe require, __esModule=true', t => {
  mock('../a', {__esModule: true, default: 'default'});
  var result = interopRequire('../a', true);
  t.assert.deepStrictEqual(result, 'default');
});

test('extend 1', t => {
  const source = {
    get a() {
      return 1;
    }
  };
  const target = {};
  util.extend(target, source);
  t.assert.strictEqual(target.a, 1);
});

test('extend 2', t => {
  const source = {
    get a() {
      return 1;
    },
    set a(value) {
      this.aaa = value;
    }
  };
  const target = {};
  util.extend(target, source);
  source.a = 333;
  target.a = 222;
  t.assert.strictEqual(source.aaa, 333);
  t.assert.strictEqual(target.aaa, 222);
});

test('extend 3', t => {
  const source = {
    get a() {
      return 1;
    },
    set a(value) {
      this.aaa = value;
    }
  };
  const target = { /* eslint accessor-pairs: ["error", { "setWithoutGet": false }] */
    set a(value) {
      this.bbb = 22;
    }
  };
  util.extend(target, source);
  source.a = 333;
  target.a = 222;
  t.assert.strictEqual(source.aaa, 333);
  t.assert.strictEqual(target.aaa, 222);
  t.assert.strictEqual(target.bbb, undefined);
});
