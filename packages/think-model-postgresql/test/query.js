const {test} = require('node:test');
const Query = require('../lib/query');
const Socket = require('../lib/socket');

test('socket', t => {
  t.plan(2);

  const query = new Query();
  query.__proto__.__proto__.socket = function(sql, socket) {
    t.assert.strictEqual(sql, 'lizheming');
    t.assert.strictEqual(socket === Socket, true);
  };
  query.socket('lizheming');
});

test('query', async t => {
  t.plan(3);

  const query = new Query();
  query.__proto__.__proto__.query = function(sqlOptions, connection) {
    t.assert.strictEqual(sqlOptions, 1);
    t.assert.strictEqual(connection, 2);
    return Promise.resolve({ rows: 3 });
  };
  t.assert.strictEqual(await query.query(1, 2), 3);
});

test('excute', async t => {
  t.plan(8);

  const query = new Query();
  query.__proto__.__proto__.execute = function(sqlOptions, connection) {
    t.assert.strictEqual(sqlOptions, 1);
    t.assert.strictEqual(connection, 2);
    return Promise.resolve({ command: 'SELECT' });
  };

  t.assert.strictEqual(await query.execute(1, 2), 0);

  const query2 = new Query();
  query2.__proto__.__proto__.execute = () => Promise.resolve({ command: 'SELECT', rowCount: 1024 });
  t.assert.strictEqual(await query.execute(), 1024);

  const query3 = new Query();
  query3.__proto__.__proto__.execute = () => Promise.resolve({ command: 'INSERT', rows: [{ a: 1, b: 2 }] });
  await query3.execute();
  t.assert.strictEqual(query3.lastInsertId, 1);

  const query4 = new Query();
  query4.__proto__.__proto__.execute = () => Promise.resolve({ command: 'INSERT', rows: [{ a: false, b: 2 }] });
  await query4.execute();
  t.assert.strictEqual(query4.lastInsertId, 0);

  const query5 = new Query();
  query5.__proto__.__proto__.execute = () => Promise.resolve({ command: 'INSERT', rows: [{ uid: '34b0', b: 2 }] });
  await query5.execute();
  t.assert.strictEqual(query5.lastInsertId, '34b0');

  const query6 = new Query();
  query6.__proto__.__proto__.execute = () => Promise.resolve({ command: 'INSERT', rows: { a: 1 } });
  await query6.execute();
  t.assert.strictEqual(query6.lastInsertId, 0);
});
