const {test} = require('node:test');
const helmet = require('../index.js');

test('helmet', t => {
  t.assert.strictEqual(typeof helmet === 'function', true);
});
