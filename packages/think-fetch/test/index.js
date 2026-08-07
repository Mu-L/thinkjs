const {test, before, after} = require('node:test');
const startServer = require('./server.js');
const fetch = require('../index.js').controller.fetch;
let stopServer = null;

before(t => {
  startServer(1995, stop => {
    stopServer = stop;
  });
});

test('Fetch', t => {
  return fetch('http://127.0.0.1:1995/200').then(res => {
    t.assert.strictEqual(res.ok, true);
  });
});

test('should return a promise', t => {
  const p = fetch('http://127.0.0.1:1995/200');
  t.assert.strictEqual(p instanceof fetch.Promise, true)
});

test('Should return 404 status', t => {
  return fetch('http://127.0.0.1:1995/404').then(res => {
    t.assert.strictEqual(res.status, 404);
  });
});

test('Should can get the correct text', t => {
  return fetch('http://127.0.0.1:1995/200').then(res => res.text()).then(text => {
    t.assert.strictEqual(text, 'GET /200');
  });
});

test('Should can get the correct json', t => {
  return fetch('http://127.0.0.1:1995/json').then(res => res.json()).then(json => {
    t.assert.deepStrictEqual(json, {name: 'value'});
  });
});

after(t => {
  stopServer();
});