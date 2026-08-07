const {test} = require('node:test');
const proxy = require('..');

test('requires non-empty options', t => {
  let error;
  t.assert.throws(() => proxy(), caughtError => {
    error = caughtError;
    return true;
  });
  t.assert.match(error.message, /must have options/);
});

test('requires options to be an array or object', t => {
  let error;
  t.assert.throws(() => proxy('invalid'), caughtError => {
    error = caughtError;
    return true;
  });
  t.assert.match(error.message, /options must be an array or an object/);
});

test('creates middleware from array options', async t => {
  const middleware = proxy([{
    host: 'http://example.com',
    suppressRequestHeaders: ['X-Request-Id'],
    suppressResponseHeaders: ['X-Powered-By']
  }]);
  let calledNext = false;

  await middleware({path: '/api'}, async() => {
    calledNext = true;
  });

  t.assert.strictEqual(calledNext, false);
});
