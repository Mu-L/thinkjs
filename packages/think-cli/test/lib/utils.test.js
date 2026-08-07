const {test} = require('node:test');
const utils = require('../../lib/utils.js');

test('The correct prefix should be returned', t => {
  t.assert.strictEqual(utils.getPrefix('/dir/dir2/test.js'), '../../');
  t.assert.strictEqual(utils.getPrefix('/test.js'), './');
  t.assert.strictEqual(utils.getPrefix('test'), './');
});

test('The correct action name should be returned', t => {
  t.assert.strictEqual(utils.getActionName('test.js'), 'test');
});

test('utils.parsePath', t => {
  const data = {a: {b: {c : 'hello'}}};
  t.assert.strictEqual(utils.parsePath('a.b.c')(data), 'hello');
});

test('utils.isLocalPath', t => {
  const data = {a: {b: {c : 'hello'}}};
  t.assert.strictEqual(utils.isLocalPath('./a/b/c'), true);
  t.assert.strictEqual(utils.isLocalPath('/a/b/c'), true);
  t.assert.strictEqual(utils.isLocalPath('a/b'), false);
});
