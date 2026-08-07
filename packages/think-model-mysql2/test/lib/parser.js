const {test} = require('node:test');
const helper = require('think-helper');
const Base = require('../../lib/parser');

test('escapeString is function', t => {
  const instance = new Base();
  t.assert.strictEqual(helper.isFunction(instance.escapeString), true);
});

test('escapeString, empty', t => {
  const instance = new Base();
  const data = instance.escapeString();
  t.assert.strictEqual(data, '');
});

test('escapeString, \\n', t => {
  const instance = new Base();
  const data = instance.escapeString('\n');
  t.assert.strictEqual(data, '\\n');
});

test('escapeString, \\0', t => {
  const instance = new Base();
  const data = instance.escapeString('\0');
  t.assert.strictEqual(data, '\\0');
});

test('escapeString, \\r', t => {
  const instance = new Base();
  const data = instance.escapeString('\r');
  t.assert.strictEqual(data, '\\r');
});

test('escapeString, \\b', t => {
  const instance = new Base();
  const data = instance.escapeString('\b');
  t.assert.strictEqual(data, '\\b');
});

test('escapeString, \\t', t => {
  const instance = new Base();
  const data = instance.escapeString('\t');
  t.assert.strictEqual(data, '\\t');
});

test('escapeString, \\Z', t => {
  const instance = new Base();
  const data = instance.escapeString('\u001a');
  t.assert.strictEqual(data, '\\Z');
});

test('escapeString, \\"', t => {
  const instance = new Base();
  const data = instance.escapeString('"');
  t.assert.strictEqual(data, '\\"');
});

test('parseKey is function', t => {
  const cases = [
    ['key', '`key`'],
    ['    ', ''],
    [' 3 ', '3'],
    ['3,', '3,'],
    ['3\'', '3\''],
    ['3"', '3"'],
    ['3*', '3*'],
    ['3(', '3('],
    ['3)', '3)'],
    ['3 3', '3 3'],
    ['`3`', '`3`'],
    ['3.3', '3.3'],
    ['li.zheming', 'li.zheming']
  ];
  t.plan(cases.length);
  const instance = new Base();
  cases.forEach(([param, expect]) => t.assert.strictEqual(instance.parseKey(param), expect));
});

test('buildInsertSql with super', t => {
  const instance = new Base();
  instance.__proto__.__proto__.buildInsertSql = function() {
    t.assert.ok(true);
    return 'lizheming';
  };

  const params = [
    [{}, null],
    [{}, true]
  ];

  t.plan(params.length * 2);
  params.forEach(param =>
    t.assert.strictEqual(instance.buildInsertSql.apply(instance, param), 'lizheming')
  );
});

test('buildInsertSql with array update', t => {
  const instance = new Base();
  const options = {
    table: 'user',
    fields: 'id, name, email',
    values: '1, "lizheming", "i@imnerd.org"',
    update: ['id', 'title'],
    lock: 'lock',
    comment: 'comment'
  };

  instance.parseTable = function(table) {
    t.assert.strictEqual(table, options.table);
    return table;
  };

  instance.parseKey = function(key) {
    return '$' + key + '$';
  };

  instance.parseLock = function(lock) {
    t.assert.strictEqual(lock, 'lock');
    return '';
  };

  instance.parseComment = function(comment) {
    t.assert.strictEqual(comment, 'comment');
    return '';
  };

  t.assert.strictEqual(
    instance.buildInsertSql(options),
    'INSERT INTO user (id, name, email) VALUES (1, "lizheming", "i@imnerd.org") ON DUPLICATE KEY UPDATE $id$=VALUES($id$),$title$=VALUES($title$)'
  );
});

test('buildInsertSql with object update', t => {
  const instance = new Base();
  const options = {
    table: 'user',
    fields: 'id, name, email',
    values: '(1, "lizheming", "i@imnerd.org")',
    update: {
      name: 'lizheming111',
      title: { a: 1 }
    },
    lock: 'lock',
    comment: 'comment'
  };

  instance.parseTable = function(table) {
    t.assert.strictEqual(table, options.table);
    return table;
  };

  instance.parseKey = function(key) {
    return '$' + key + '$';
  };

  instance.parseValue = function(value) {
    if (typeof value === 'string') {
      t.assert.strictEqual(value, 'lizheming111');
      return '`' + value + '`';
    } else {
      t.assert.deepStrictEqual(value, { a: 1 });
      return value;
    }
  };

  instance.parseLock = function(lock) {
    t.assert.strictEqual(lock, 'lock');
    return ' lock2';
  };

  instance.parseComment = function(comment) {
    t.assert.strictEqual(comment, 'comment');
    return ' comment2';
  };

  t.assert.strictEqual(
    instance.buildInsertSql(options),
    'INSERT INTO user (id, name, email) VALUES (1, "lizheming", "i@imnerd.org") ON DUPLICATE KEY UPDATE $name$=`lizheming111` lock2 comment2'
  );
});

test('buildInsertSql with empty update', t => {
  const instance = new Base();
  const options = {
    table: 'user',
    fields: 'id, name, email',
    values: '(1, "lizheming", "i@imnerd.org")',
    update: {
      // name: 'lizheming111',
      title: { a: 1 }
    },
    lock: 'lock',
    comment: 'comment'
  };

  instance.parseLock = instance.parseComment = () => '';

  t.assert.strictEqual(
    instance.buildInsertSql(options),
    'INSERT INTO `user` (id, name, email) VALUES (1, "lizheming", "i@imnerd.org")'
  );
});
