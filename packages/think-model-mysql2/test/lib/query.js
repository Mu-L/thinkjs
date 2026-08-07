const {test} = require('node:test');
const helper = require('think-helper');
const Base = require('../../lib/query');
const Parser = require('../../lib/parser');

test('select jsonFormat false', t => {
  t.plan(2);

  const instance = new Base();
  instance.__proto__.__proto__.select = function(options, cache) {
    t.assert.strictEqual(options, 1);
    t.assert.strictEqual(cache, 2);
  }
  instance.select(1, 2);
})

test('select jsonFormat true', async t => {
  t.plan(2);
  
  const instance = new Base({jsonFormat: true});
  instance.schema = {
    getSchema() {
      return {
        title: {
          tinyType: 'varchar'
        },
        content: {
          tinyType: 'varchar'
        },
        json: {
          tinyType: 'json'
        }
      };
    }
  }
  instance.__proto__.__proto__.select = function() {
    return {title: 'hello', content: 'world', json: JSON.stringify([1,2,3,4])};
  }
  const data = await instance.select();
  t.assert.deepStrictEqual(data, {title: 'hello', content: 'world', json: [1,2,3,4]});


  instance.__proto__.__proto__.select = function() {
    return [{title: 'hello', content: 'world', json: JSON.stringify([1,2,3,4])}];
  }
  const data2 = await instance.select();
  t.assert.deepStrictEqual(data2, [{title: 'hello', content: 'world', json: [1,2,3,4]}]);
});

test('socket is function', t => {
  const instance = new Base();
  t.assert.strictEqual(helper.isFunction(instance.socket), true);
});

test('parser is getter', t => {
  const instance = new Base();
  instance.parser = new Parser();
  const parser = instance.parser;
  t.assert.strictEqual(parser instanceof Parser, true);
});

test('parser is getter 2', t => {
  const instance = new Base();
  instance.parser = new Parser();
  const parser = instance.parser;
  const parser2 = instance.parser;
  t.assert.strictEqual(parser instanceof Parser, true);
  t.assert.strictEqual(parser === parser2, true);
});

test('query', async t => {
  t.plan(2);

  const instance = new Base();
  instance.socket = t => {
    return {
      query: function(sql) {
        return Promise.resolve(sql);
      }
    };
  };
  const data = await instance.query('SELECT * FROM think_user');
  t.assert.strictEqual(data, 'SELECT * FROM think_user');
  t.assert.strictEqual(instance.lastSql, 'SELECT * FROM think_user');
});

test('execute', async t => {
  t.plan(2);

  const instance = new Base();
  instance.socket = t => {
    return {
      execute: function(sql) {
        return Promise.resolve({
          insertId: 1000,
          affectedRows: 10
        });
      }
    };
  };
  const data = await instance.execute('DELETE FROM think_user');
  t.assert.strictEqual(data, 10);
  t.assert.strictEqual(instance.lastInsertId, 1000);
});

test('execute, empty return', async t => {
  t.plan(2);

  const instance = new Base();
  instance.socket = t => {
    return {
      execute: function(sql) {
        return Promise.resolve({
        });
      }
    };
  };
  const data = await instance.execute('DELETE FROM think_user');
  t.assert.strictEqual(data, 0);
  t.assert.strictEqual(instance.lastInsertId, 0);
});

// test('close', t => {
//   const instance = new Base({buffer_tostring: true});
//   let flag = false;
//   instance._socket = {
//     close: t => {
//       flag = true;
//     }
//   };
//   instance.close();
//   t.is(flag, true);
// });

// test('close #2', t => {
//   const instance = new Base({buffer_tostring: true});
//   const flag = false;
//   instance.close();
//   t.is(flag, false);
// });

// test('startTrans', async t => {
//   const instance = new Base();
//   let flag = false;
//   instance.execute = function(sql) {
//     t.is(sql, 'START TRANSACTION');
//     flag = true;
//     return Promise.resolve();
//   };
//   const data = await instance.startTrans();
//   t.true(flag);
//   instance.transTimes = 1;
// });

// test('startTrans, is started', async t => {
//   const instance = new Base();
//   instance.transTimes = 1;
//   let flag = false;
//   instance.execute = function(sql) {
//     t.is(sql, 'START TRANSACTION');
//     flag = true;
//     return Promise.resolve();
//   };
//   const data = await instance.startTrans();
//   t.is(flag, false);
//   instance.transTimes = 1;
// });

// test('commit, not start', async t => {
//   const instance = new Base();
//   let flag = false;
//   instance.execute = function(sql) {
//     t.is(sql, 'ROLLBACK');
//     flag = true;
//     return Promise.resolve();
//   };
//   const data = await instance.commit();
//   t.false(flag);
//   instance.transTimes = 0;
// });

// test('commit', async t => {
//   const instance = new Base();
//   instance.transTimes = 1;
//   let flag = false;
//   instance.execute = function(sql) {
//     t.is(sql, 'COMMIT');
//     flag = true;
//     return Promise.resolve();
//   };
//   const data = await instance.commit();
//   t.true(flag);
//   instance.transTimes = 0;
// });

// test('rollback, not start', async t => {
//   const instance = new Base();
//   let flag = false;
//   instance.execute = function(sql) {
//     t.is(sql, 'ROLLBACK');
//     flag = true;
//     return Promise.resolve();
//   };
//   const data = await instance.rollback();
//   t.false(flag);
//   instance.transTimes = 0;
// });

// test('rollback', async t => {
//   const instance = new Base();
//   instance.transTimes = 1;
//   let flag = false;
//   instance.execute = function(sql) {
//     t.is(sql, 'ROLLBACK');
//     flag = true;
//     return Promise.resolve();
//   };
//   const data = await instance.rollback();
//   t.true(flag);
//   instance.transTimes = 0;
// });
