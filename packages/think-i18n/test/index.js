const {test} = require('node:test');
const path = require('path');
const mock = require('mock-require');

test('test index will return i18n.extend', t=>{
  var mockI18n = function() {
  };
  var options;
  mockI18n.prototype.extend = function(opts) {
    options = opts;
  }
  mock('../src/i18n', mockI18n);

  const index = require('../index');
  index('options');
  t.assert.strictEqual(options, 'options');
});
