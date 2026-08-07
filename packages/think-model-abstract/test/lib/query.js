const {test} = require('node:test');
const helper = require('think-helper');
const Base = require('../../lib/query');
const Parser = require('../../lib/parser');

test('get instance', t => {
  const instance = new Base();
  t.assert.strictEqual(instance.lastInsertId, 0);
});

test('add data', async t => {
  const instance = new Base();
  Object.defineProperty(instance, 'parser', {
    value: new Parser()
  });
  instance.execute = function(sql) {
    this.lastSql = sql;
    return Promise.resolve(sql);
  };

  await instance.add({
    name: 'lizheming',
    title: 'suredy',
    key: 1111,
    admin: true,
    hello: { a: 1 }
  }, {
    table: 'think_user'
  });
  t.assert.strictEqual(instance.lastSql, "INSERT INTO think_user (name,title,key,admin) VALUES ('lizheming','suredy',1111,1)");
});

test('add with update boolean', async t => {
  t.plan(2);

  const instance = new Base();
  class NewParser extends Parser {
    buildInsertSql(options) {
      t.assert.deepStrictEqual(options.update, ['name', 'title', 'key']);
      return super.buildInsertSql(options);
    }
  }
  Object.defineProperty(instance, 'parser', {
    value: new NewParser()
  });
  instance.execute = function(sql) {
    this.lastSql = sql;
    return Promise.resolve(sql);
  };
  await instance.add({
    name: 'lizheming',
    title: 'suredy',
    key: 1111
  }, {
    table: 'think_user',
    update: true
  });
  t.assert.strictEqual(instance.lastSql, "INSERT INTO think_user (name,title,key) VALUES ('lizheming','suredy',1111)");
});

test('add with update array', async t => {
  t.plan(2);

  const instance = new Base();
  class NewParser extends Parser {
    buildInsertSql(options) {
      t.assert.deepStrictEqual(options.update, ['name', 'title', 'key']);
      return super.buildInsertSql(options);
    }
  }
  Object.defineProperty(instance, 'parser', {
    value: new NewParser()
  });
  instance.execute = function(sql) {
    this.lastSql = sql;
    return Promise.resolve(sql);
  };
  await instance.add({
    name: 'lizheming',
    title: 'suredy',
    key: 1111
  }, {
    table: 'think_user',
    update: ['name', 'title', 'key', 'hello']
  });
  t.assert.strictEqual(instance.lastSql, "INSERT INTO think_user (name,title,key) VALUES ('lizheming','suredy',1111)");
});

test('add with update object', async t => {
  t.plan(2);

  const instance = new Base();
  class NewParser extends Parser {
    buildInsertSql(options) {
      t.assert.deepStrictEqual(options.update, {
        name: 3,
        title: 4
      });
      return super.buildInsertSql(options);
    }
  }
  Object.defineProperty(instance, 'parser', {
    value: new NewParser()
  });
  instance.execute = function(sql) {
    this.lastSql = sql;
    return Promise.resolve(sql);
  };
  await instance.add({
    name: 'lizheming',
    title: 'suredy',
    key: 1111
  }, {
    table: 'think_user',
    update: {
      name: 3,
      title: 4,
      hello: 5
    }
  });
  t.assert.strictEqual(instance.lastSql, "INSERT INTO think_user (name,title,key) VALUES ('lizheming','suredy',1111)");
});

test('add many', async t => {
  t.plan(2);

  const instance = new Base();
  Object.defineProperty(instance, 'parser', {
    value: new Parser()
  });
  instance.execute = function(sql) {
    this.lastSql = sql;
    return Promise.resolve(sql);
  };
  const ret = await instance.addMany([{
    name: 'lizheming',
    title: 'suredy',
    key: 1111,
    admin: true,
    hello: { a: 1 }
  }, {
    name: 'lizheming2',
    title: 'suredy2',
    key: 222,
    admin: false,
    hello: { a: 1 }
  }], {
    table: 'think_user'
  });
  t.assert.deepStrictEqual(ret, [0, 0]);
  t.assert.strictEqual(instance.lastSql, "INSERT INTO think_user (name,title,key,admin,hello) VALUES ('lizheming','suredy',1111,1),('lizheming2','suredy2',222,0)");
});

test('add many with lastInsertId', async t => {
  t.plan(2);

  const instance = new Base();
  Object.defineProperty(instance, 'parser', {
    value: new Parser()
  });
  instance.execute = function(sql) {
    this.lastSql = sql;
    return Promise.resolve(sql);
  };
  instance.lastInsertId = 30;
  const ret = await instance.addMany([{
    name: 'lizheming',
    title: 'suredy',
    key: 1111,
    admin: true,
    hello: { a: 1 }
  }, {
    name: 'lizheming2',
    title: 'suredy2',
    key: 222,
    admin: false,
    hello: { a: 1 }
  }], {
    table: 'think_user'
  });
  t.assert.deepStrictEqual(ret, [30, 31]);
  t.assert.strictEqual(instance.lastSql, "INSERT INTO think_user (name,title,key,admin,hello) VALUES ('lizheming','suredy',1111,1),('lizheming2','suredy2',222,0)");
});

test('add many with update boolean', async t => {
  t.plan(2);

  const instance = new Base();
  class NewParser extends Parser {
    buildInsertSql(options) {
      t.assert.deepStrictEqual(options.update, ['name', 'title', 'key']);
      return super.buildInsertSql(options);
    }
  }
  Object.defineProperty(instance, 'parser', {
    value: new NewParser()
  });
  instance.execute = function(sql) {
    this.lastSql = sql;
    return Promise.resolve(sql);
  };
  await instance.addMany([{
    name: 'lizheming',
    title: 'suredy',
    key: 1111
  }, {
    name: 'lizheming2',
    title: 'suredy2',
    key: 222
  }], {
    table: 'think_user',
    update: true
  });
  t.assert.strictEqual(instance.lastSql, "INSERT INTO think_user (name,title,key) VALUES ('lizheming','suredy',1111),('lizheming2','suredy2',222)");
});

test('add many with update array', async t => {
  t.plan(2);

  const instance = new Base();
  class NewParser extends Parser {
    buildInsertSql(options) {
      t.assert.deepStrictEqual(options.update, ['name', 'title', 'key']);
      return super.buildInsertSql(options);
    }
  }
  Object.defineProperty(instance, 'parser', {
    value: new NewParser()
  });
  instance.execute = function(sql) {
    this.lastSql = sql;
    return Promise.resolve(sql);
  };
  await instance.addMany([{
    name: 'lizheming',
    title: 'suredy',
    key: 1111
  }, {
    name: 'lizheming2',
    title: 'suredy2',
    key: 222
  }], {
    table: 'think_user',
    update: ['name', 'title', 'key', 'hello']
  });
  t.assert.strictEqual(instance.lastSql, "INSERT INTO think_user (name,title,key) VALUES ('lizheming','suredy',1111),('lizheming2','suredy2',222)");
});

test('add many with update object', async t => {
  t.plan(2);

  const instance = new Base();
  class NewParser extends Parser {
    buildInsertSql(options) {
      t.assert.deepStrictEqual(options.update, {
        name: ['EXP', 'VALUES(name)']
      });
      return super.buildInsertSql(options);
    }
  }
  Object.defineProperty(instance, 'parser', {
    value: new NewParser()
  });
  instance.execute = function(sql) {
    this.lastSql = sql;
    return Promise.resolve(sql);
  };
  await instance.addMany([{
    name: 'lizheming',
    title: 'suredy',
    key: 1111
  }, {
    name: 'lizheming2',
    title: 'suredy2',
    key: 222
  }], {
    table: 'think_user',
    update: {
      name: ['EXP', 'VALUES(name)'],
      hello: 3
    }
  });
  t.assert.strictEqual(instance.lastSql, "INSERT INTO think_user (name,title,key) VALUES ('lizheming','suredy',1111),('lizheming2','suredy2',222)");
});

test('select add', async t => {
  const instance = new Base();
  Object.defineProperty(instance, 'parser', {
    value: new Parser()
  });
  instance.execute = function(sql) {
    return Promise.resolve(sql);
  };
  const data = await instance.selectAdd('name,title', 'suredy', {
    table: 'think_other',
    where: { name: 'lizheming' },
    limit: 30
  });
  t.assert.strictEqual(data, "INSERT INTO suredy (name,title) SELECT * FROM think_other WHERE ( name = 'lizheming' ) LIMIT 30");
});

test('select add, fields is array', async t => {
  const instance = new Base();
  Object.defineProperty(instance, 'parser', {
    value: new Parser()
  });
  instance.execute = function(sql) {
    return Promise.resolve(sql);
  };
  const data = await instance.selectAdd(['name', 'title'], 'suredy', {
    table: 'think_other',
    where: { name: 'lizheming' },
    limit: 30
  });
  t.assert.strictEqual(data, "INSERT INTO suredy (name,title) SELECT * FROM think_other WHERE ( name = 'lizheming' ) LIMIT 30");
});

test('select add, options is empty', async t => {
  const instance = new Base();
  Object.defineProperty(instance, 'parser', {
    value: new Parser()
  });
  instance.execute = function(sql) {
    return Promise.resolve(sql);
  };
  const data = await instance.selectAdd(['name', 'title'], 'suredy');
  t.assert.strictEqual(data, 'INSERT INTO suredy (name,title) SELECT * FROM ');
});

test('delete', async t => {
  const instance = new Base();
  Object.defineProperty(instance, 'parser', {
    value: new Parser()
  });
  instance.execute = function(sql) {
    return Promise.resolve(sql);
  };
  const data = await instance.delete({
    table: 'think_user',
    where: { name: 'lizheming' },
    comment: 'lizheming'
  });
  t.assert.strictEqual(data, "DELETE FROM think_user WHERE ( name = 'lizheming' ) /*lizheming*/");
});

test('update', async t => {
  const instance = new Base();
  Object.defineProperty(instance, 'parser', {
    value: new Parser()
  });
  instance.execute = function(sql) {
    return Promise.resolve(sql);
  };
  const data = await instance.update({
    name: 'lizheming',
    title: 'title'
  }, {
    table: 'think_user',
    where: { name: 'lizheming' },
    comment: 'lizheming'
  });
  t.assert.strictEqual(data, "UPDATE think_user SET name='lizheming',title='title' WHERE ( name = 'lizheming' ) /*lizheming*/");
});

test('select', async t => {
  const instance = new Base();
  Object.defineProperty(instance, 'parser', {
    value: new Parser()
  });
  instance.query = function(sql) {
    return Promise.resolve(sql);
  };
  const data = await instance.select({
    table: 'think_user',
    where: { name: 'lizheming' },
    comment: 'lizheming'
  });
  t.assert.strictEqual(data, "SELECT * FROM think_user WHERE ( name = 'lizheming' ) /*lizheming*/");
});

test('select with sql', async t => {
  const instance = new Base();
  Object.defineProperty(instance, 'parser', {
    value: new Parser()
  });
  instance.query = function(sql) {
    return Promise.resolve(sql);
  };
  const data = await instance.select({
    sql: 'hello world',
    table: 'think_user',
    where: { name: 'lizheming' },
    comment: 'lizheming'
  });
  t.assert.strictEqual(data, 'hello world');
});

test('select, cache with key', async t => {
  t.plan(2);

  const instance = new Base();
  Object.defineProperty(instance, 'parser', {
    value: new Parser()
  });
  const data = await instance.select({
    table: 'think_user',
    where: { name: 'lizheming' },
    comment: 'lizheming',
    cache: {
      key: 'hello',
      handle: class {
        get(key) {
          t.assert.strictEqual(key, 'hello');
          return Promise.resolve('hello data');
        }
      }
    }
  });
  t.assert.strictEqual(data, 'hello data');
});

test('select, no cache with key', async t => {
  t.plan(4);

  const instance = new Base();
  Object.defineProperty(instance, 'parser', {
    value: new Parser()
  });
  instance.query = function(sql) {
    return Promise.resolve(sql);
  };
  const data = await instance.select({
    table: 'think_user',
    where: { name: 'lizheming' },
    comment: 'lizheming',
    cache: {
      key: 'hello',
      handle: class {
        get(key) {
          t.assert.strictEqual(key, 'hello');
          return Promise.resolve();
        }
        set(key, data) {
          t.assert.strictEqual(key, 'hello');
          t.assert.strictEqual(data, "SELECT * FROM think_user WHERE ( name = 'lizheming' ) /*lizheming*/");
          return Promise.resolve();
        }
      }
    }
  });
  t.assert.strictEqual(data, "SELECT * FROM think_user WHERE ( name = 'lizheming' ) /*lizheming*/");
});

test('select, cache', async t => {
  t.plan(2);
  const instance = new Base();
  Object.defineProperty(instance, 'parser', {
    value: new Parser()
  });
  instance.query = function(sql) {
    return Promise.resolve(sql);
  };
  const data = await instance.select({
    table: 'think_user',
    where: { name: 'lizheming' },
    comment: 'lizheming',
    cache: {
      handle: class {
        get(key) {
          t.assert.strictEqual(key, helper.md5("SELECT * FROM think_user WHERE ( name = 'lizheming' ) /*lizheming*/"));
          return Promise.resolve('md5 data');
        }
      }
    }
  });
  t.assert.strictEqual(data, 'md5 data');
});

test('select, string', async t => {
  const instance = new Base();
  instance.query = function(sql) {
    return Promise.resolve(sql);
  };
  const data = await instance.select("SELECT * FROM think_user WHERE ( name = 'lizheming' ) /*lizheming*/");
  t.assert.strictEqual(data, "SELECT * FROM think_user WHERE ( name = 'lizheming' ) /*lizheming*/");
});

test('query is function', async t => {
  const instance = new Base();
  t.assert.strictEqual(helper.isFunction(instance.query), true);
});

test('query 1', async t => {
  const instance = new Base();
  let flag = false;
  instance.socket = sql => {
    t.assert.strictEqual(sql, 'SELECT * FROM user');
    t.assert.strictEqual(instance.lastSql, 'SELECT * FROM user');
    return {
      query: (sqlOptions, connection) => {
        flag = true;
      }
    };
  };
  instance.query('SELECT * FROM user');
  t.assert.strictEqual(flag, true);
});

test('query 2', async t => {
  const instance = new Base();
  let flag = false;
  instance.socket = sql => {
    t.assert.strictEqual(sql, 'SELECT * FROM user2');
    t.assert.strictEqual(instance.lastSql, 'SELECT * FROM user2');
    return {
      query: (sqlOptions, connection) => {
        t.assert.strictEqual(sqlOptions.a, 'b');
        flag = true;
      }
    };
  };
  instance.query({ sql: 'SELECT * FROM user2', a: 'b' });
  t.assert.strictEqual(flag, true);
});

test('execute 1', async t => {
  const instance = new Base();
  let flag = false;
  instance.socket = sql => {
    t.assert.strictEqual(sql, 'SELECT * FROM user');
    t.assert.strictEqual(instance.lastSql, 'SELECT * FROM user');
    return {
      execute: (sqlOptions, connection) => {
        flag = true;
      }
    };
  };
  instance.execute('SELECT * FROM user');
  t.assert.strictEqual(flag, true);
});

test('execute 2', async t => {
  const instance = new Base();
  let flag = false;
  instance.socket = sql => {
    t.assert.strictEqual(sql, 'SELECT * FROM user2');
    t.assert.strictEqual(instance.lastSql, 'SELECT * FROM user2');
    return {
      execute: (sqlOptions, connection) => {
        t.assert.strictEqual(sqlOptions.a, 'b');
        flag = true;
      }
    };
  };
  instance.execute({ sql: 'SELECT * FROM user2', a: 'b' });
  t.assert.strictEqual(flag, true);
});

test('socket 1', async t => {
  const instance = new Base();
  const result = instance.socket('SQL', {
    getInstance: function() {
      return 1;
    }
  });
  t.assert.strictEqual(result, 1);
});

test('socket 2', async t => {
  const instance = new Base({
    c: 2,
    parser: function(sql) {
      t.assert.strictEqual(sql, 'SQL');
      return { a: 'b' };
    }
  });
  const result = instance.socket('SQL', {
    getInstance: function(config) {
      t.assert.strictEqual(config.a, 'b');
      t.assert.strictEqual(config.c, 2);
      return 2;
    }
  });
  t.assert.strictEqual(result, 2);
});

test('socket 3', async t => {
  const instance = new Base({
    c: 2
  });
  const result = instance.socket('SQL', {
    getInstance: function(config) {
      t.assert.strictEqual(config.c, 2);
      return 2;
    }
  });
  t.assert.strictEqual(result, 2);

  const result2 = instance.socket('SQL');
  t.assert.strictEqual(result2, 2);
});

test('startTrans', async t => {
  const instance = new Base({});
  let flag = false;
  instance.socket = () => {
    return {
      startTrans: connection => {
        flag = true;
        return Promise.resolve(connection);
      }
    };
  };
  instance.startTrans({ a: 1 }).then(data => {
    t.assert.strictEqual(instance.connection.a, 1);
    t.assert.strictEqual(flag, true);
  });
});

test('commit 1', async t => {
  const instance = new Base({});
  let flag = false;
  instance.socket = () => {
    return {
      commit: connection => {
        flag = true;
        t.assert.strictEqual(connection.a, 1);
        return Promise.resolve(connection);
      }
    };
  };
  instance.commit({ a: 1 }).then(data => {
    t.assert.strictEqual(flag, true);
  });
});

test('commit 2', async t => {
  const instance = new Base({});
  let flag = false;
  instance.socket = () => {
    return {
      commit: connection => {
        flag = true;
        t.assert.strictEqual(connection.a, 1);
        return Promise.resolve(connection);
      }
    };
  };
  instance.connection = { a: 1 };
  instance.commit().then(data => {
    t.assert.strictEqual(flag, true);
  });
});

test('rollback 1', async t => {
  const instance = new Base({});
  let flag = false;
  instance.socket = () => {
    return {
      rollback: connection => {
        flag = true;
        t.assert.strictEqual(connection.a, 1);
        return Promise.resolve(connection);
      }
    };
  };
  instance.rollback({ a: 1 }).then(data => {
    t.assert.strictEqual(flag, true);
  });
});

test('rollback 2', async t => {
  const instance = new Base({});
  let flag = false;
  instance.socket = () => {
    return {
      rollback: connection => {
        flag = true;
        t.assert.strictEqual(connection.a, 1);
        return Promise.resolve(connection);
      }
    };
  };
  instance.connection = { a: 1 };
  instance.rollback().then(data => {
    t.assert.strictEqual(flag, true);
  });
});

test('transaction 1', async t => {
  const instance = new Base({});
  let flag = false;
  instance.socket = () => {
    return {
      transaction: (fn, connection) => {
        flag = true;
        t.assert.strictEqual(fn(), 1);
        return Promise.resolve(connection);
      }
    };
  };
  instance.transaction(function() {
    return 1;
  }).then(data => {
    t.assert.strictEqual(flag, true);
  });
});
