const test = require('../../../test/ava.cjs');
const helmet = require('../index.js');

test('helmet', t => {
  t.is(typeof helmet === 'function', true);
});
