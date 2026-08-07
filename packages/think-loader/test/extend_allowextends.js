const {test} = require('node:test');

test('extend.allowExtends', t => {
  var allowExtends = require('../loader/extend').allowExtends;
  t.assert.deepStrictEqual(allowExtends, ['think', 'application', 'context', 'request', 'response', 'controller', 'logic', 'service']);
});
