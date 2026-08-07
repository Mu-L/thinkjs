const {test} = require('node:test');
const Parser = require('../src/parser');
const {ObjectID} = require('mongodb');
const parser = new Parser();

test('parseField with array field', async t => {
  const ret = parser.parseField(['name', 'gender'], 1);
  t.assert.strictEqual(ret.name, 0);
});

test('parseField with object field', async t => {
  const ret = parser.parseField({name: 'think'});
  t.assert.strictEqual(ret.name, 'think');
});

test('parseOrder', async t => {
  const ret = parser.parseOrder(true);
  t.assert.strictEqual(ret.$natural, 1);
});

test('parseOrder with array', async t => {
  const ret = parser.parseOrder(['id', 'name']);
  t.assert.deepStrictEqual(ret, [1, 1]);
});

test('parseOrder with array #2', async t => {
  const ret = parser.parseOrder('id DESC,name');
  t.assert.deepStrictEqual(ret, {id: -1, name: 1});
});

test('parseWhere with array', async t => {
  const where = [{_id: new ObjectID()}];
  const ret = parser.parseWhere(where);
  t.assert.deepStrictEqual(!!ret, true);
});

test('parseWhere with array 2', async t => {
  const where = [{_id: 'thinkjs'}];
  const ret = parser.parseWhere(where);
  t.assert.deepStrictEqual(ret, [{_id: 'thinkjs'}]);
});
