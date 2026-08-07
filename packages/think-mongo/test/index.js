const {test, afterEach} = require('node:test');
const model = require('../src/model');

const defaultTable = 'test';
const defaultOptions = {
  database: 'think_db',
  pagesize: 2
};

const manyData = [
  {name: 'thinkjs', version: '3.0', age: 1},
  {name: 'thinkjs', version: '2.0', age: 2},
  {name: 'thinkjs', version: '1.0', age: 3},
  {name: 'kobe', age: 37, version: 1},
  {name: 'lebron', age: 30, version: 1},
  {name: 'durant', age: 28, version: 1},
  {name: 'curry', age: 28, version: 1}
];

afterEach(async _ => {
  const m = new model(defaultTable, defaultOptions);
  await m.delete();
  await m.table('think').delete();
});

test('transaction', async t => {
  const m = new model(defaultTable, defaultOptions);
  await m.transaction(async session => {
    await m.add({name: 'thinkjs'});
  });
  const ret = await m.select();
  t.assert.strictEqual(ret.length, 1);
});

test('model', async t => {
  const m = new model(defaultTable, defaultOptions);
  const ret = m.model('test');
  t.assert.strictEqual(ret.modelName, 'test');
});

test('add data', async t => {
  const m = new model(defaultTable, defaultOptions);
  const insertId = await m.add({name: 'thinkjs'});
  t.assert.strictEqual(!!insertId, true);
});

test('where', async t => {
  const m = new model(defaultTable, defaultOptions);
  const data = {name: 'query data'};
  await m.add(data);
  const ret = await m.where(data).find();
  t.assert.strictEqual(ret.name, data.name);
});

test('where with empty', async t => {
  const m = new model(defaultTable, defaultOptions);
  const data = {name: 'query data'};
  await m.add(data);
  const ret = await m.where().find();
  t.assert.strictEqual(ret.name, data.name);
});

test('field', async t => {
  const m = new model(defaultTable, defaultOptions);
  const data = [
    {name: 'thinkjs', version: 3},
    {name: 'thinkjs', version: 2}
  ];
  await m.addMany(data);
  const ret = await m.field('version').select();
  t.assert.strictEqual(ret[0].name, undefined);
  t.assert.strictEqual(ret[1].version, 2);
});

test('field with empty', async t => {
  const m = new model(defaultTable, defaultOptions);
  const data = {name: 'thinkjs', version: 3};
  await m.add(data);
  const ret = await m.field().select();
  t.assert.strictEqual(ret[0].name, data.name);
});

test('limit', async t => {
  const m = new model(defaultTable, defaultOptions);
  await m.addMany(manyData);
  const ret = await m.limit(1).select();
  t.assert.strictEqual(ret[0].version, manyData[0].version);
  t.assert.strictEqual(ret.length, 1);
});

test('limit without params', async t => {
  const m = new model(defaultTable, defaultOptions);
  await m.addMany(manyData);
  const ret = await m.limit().select();
  t.assert.strictEqual(ret.length, manyData.length);
});

test('limit with array params', async t => {
  const m = new model(defaultTable, defaultOptions);
  await m.addMany(manyData);
  const ret = await m.limit([1, 2]).select();
  t.assert.strictEqual(ret.length, 2);
});

test('limit with two params', async t => {
  const m = new model(defaultTable, defaultOptions);
  await m.addMany(manyData);
  const ret = await m.limit([1], 2).select();
  t.assert.strictEqual(ret.length, 2);
});

test('limit with invalid offset and limit', async t => {
  const m = new model(defaultTable, defaultOptions);
  await m.addMany(manyData);
  const ret = await m.limit('t', 'j').select();
  t.assert.strictEqual(ret.length, manyData.length);
});

test('page', async t => {
  const m = new model(defaultTable, defaultOptions);
  await m.addMany(manyData);
  const ret = await m.page(1, 2).select();
  t.assert.strictEqual(ret.length, 2);
  t.assert.strictEqual(ret[0].version, manyData[0].version);
});

test('page without pagesize params', async t => {
  const m = new model(defaultTable, defaultOptions);
  await m.addMany(manyData);
  const ret = await m.page([1, 2]).select();
  t.assert.strictEqual(ret.length, 2);
  t.assert.strictEqual(ret[0].version, manyData[0].version);
});

test('page with array params', async t => {
  const m = new model(defaultTable, defaultOptions);
  await m.addMany(manyData);
  const ret = await m.page([1]).select();
  t.assert.strictEqual(ret.length, 2);
  t.assert.strictEqual(ret[0].version, manyData[0].version);
});

test('page with no params', async t => {
  const opt = Object.assign({}, defaultOptions, {pagesize: null});
  const m = new model(defaultTable, opt);
  await m.addMany(manyData);
  const ret = await m.page().select();
  t.assert.strictEqual(ret.length, manyData.length);
  t.assert.strictEqual(ret[0].version, manyData[0].version);
});

test('table', async t => {
  const m = new model(defaultTable, defaultOptions);
  await m.table('think').addMany(manyData);
  const ret = await m.table('think').select();
  t.assert.strictEqual(ret.length, manyData.length);
});

test('order', async t => {
  const m = new model(defaultTable, defaultOptions);
  await m.addMany(manyData);
  const ret = await m.where({name: 'thinkjs'}).order('version ASC').select();
  t.assert.strictEqual(ret[0].version, '1.0');
});

test('order #2', async t => {
  const m = new model(defaultTable, defaultOptions);
  await m.addMany(manyData);
  const ret = await m.group('name').select();
  t.assert.strictEqual(ret.length, manyData.length);
});

test('thenAdd with exist data', async t => {
  const m = new model(defaultTable, defaultOptions);
  await m.addMany(manyData);
  await m.thenAdd(manyData[0], manyData[0]);
  const ret = await m.select();
  t.assert.strictEqual(ret.length, manyData.length);
});

test('thenAdd with no-exist data', async t => {
  const m = new model(defaultTable, defaultOptions);
  await m.addMany(manyData);
  await m.thenAdd({name: 'harden'}, {name: 'harden'});
  const ret = await m.select();
  t.assert.strictEqual(ret.length, manyData.length + 1);
});

test('thenUpdate with exist', async t => {
  const m = new model(defaultTable, defaultOptions);
  await m.addMany(manyData);
  await m.thenUpdate({age: 100}, manyData[0]);
  const ret = await m.select();
  t.assert.strictEqual(ret[0].age, 100);
});

test('thenUpdate with no-exist', async t => {
  const m = new model(defaultTable, defaultOptions);
  await m.addMany(manyData);
  await m.thenUpdate({name: 'harden'}, {name: 'harden'});
  const ret = await m.where({name: 'harden'}).find();
  t.assert.strictEqual(!!ret, true);
});

test('updateMany', async t => {
  const m = new model(defaultTable, defaultOptions);
  await m.addMany(manyData);
  await m.updateMany([{name: 'think'}]);
  const ret = await m.where({name: 'think'}).find();
  t.assert.strictEqual(!!ret, true);
});

test('update with no-exist', async t => {
  const m = new model(defaultTable, defaultOptions);
  await m.addMany(manyData);
  const d = await m.where({name: 'kobe'}).find();
  const ret = m.where({name: 'fake kobe'}).update({name: 'kobe bryant', _id: d._id}, true);
  t.assert.strictEqual(!!ret, true);
});

test('countSelect', async t => {
  const m = new model(defaultTable, defaultOptions);
  await m.addMany(manyData);
  const ret = await m.page(1, 2).countSelect();
  t.assert.strictEqual(!!ret.currentPage, true);
});

test('countSelect with limit', async t => {
  const m = new model(defaultTable, defaultOptions);
  await m.addMany(manyData);
  const ret = await m.countSelect({}, true);
  t.assert.strictEqual(!!ret.currentPage, true);
});

test('countSelect with limit #2', async t => {
  const m = new model(defaultTable, defaultOptions);
  await m.addMany(manyData);
  let ret = await m.countSelect({limit: [10, 2]}, true);
  t.assert.strictEqual(!!ret.currentPage, true);
  ret = await m.countSelect({limit: [10, 2]}, false);
  t.assert.strictEqual(!!ret.currentPage, true);
});

test('countSelect with limit #3', async t => {
  const m = new model(defaultTable, defaultOptions);
  const ret = await m.countSelect();
  t.assert.deepStrictEqual(ret.data, []);
});

test('increment', async t => {
  const m = new model(defaultTable, defaultOptions);
  await m.addMany(manyData);
  const ret = await m.where({age: 1}).increment('age');
  t.assert.deepStrictEqual(!!ret, true);
});

test('decrement', async t => {
  const m = new model(defaultTable, defaultOptions);
  await m.addMany(manyData);
  const ret = await m.where({age: 3}).decrement('age');
  t.assert.deepStrictEqual(!!ret, true);
});

test('mapReduce', async t => {
  const m = new model(defaultTable, defaultOptions);
  await m.addMany(manyData);
  // Map function
  var map = function() { emit(this.age, 1) };
  // Reduce function
  var reduce = function(k, vals) { return 1 };
  const ret = await m.mapReduce(map, reduce, {out: {replace: 'tempCollection'}});
  t.assert.deepStrictEqual(!!ret, true);
});

test('getIndex', async t => {
  const m = new model(defaultTable, defaultOptions);
  await m.addMany(manyData);
  const ret = await m.getIndexes();
  t.assert.deepStrictEqual(!!ret, true);
});

test('sum', async t => {
  const m = new model(defaultTable, defaultOptions);
  await m.addMany(manyData);
  const ret = await m.sum('age');
  const sum = manyData.reduce((s, i) => s + i.age, 0);
  t.assert.deepStrictEqual(ret, sum);
});

test('group sum', async t => {
  const m = new model(defaultTable, defaultOptions);
  await m.addMany(manyData);
  const ret = await m.group('name').sum('age');
  const sum = manyData.filter(item => item.name === 'thinkjs').reduce((s, i) => s + i.age, 0);
  const thinkSum = ret.filter(item => item.group === 'thinkjs')[0].total;
  t.assert.deepStrictEqual(thinkSum, sum);
});

test('group sum #2', async t => {
  const m = new model(defaultTable, defaultOptions);
  await m.addMany(manyData);
  const ret = await m.where({name: 'thinkjs'}).order('version ASC').group('name,version').sum('age');
  const think1Sum = ret.filter(item => item.group.name === 'thinkjs' && item.group.version === '3.0')[0].total;
  t.assert.deepStrictEqual(think1Sum, 1);
});

test('aggregate', async t => {
  const m = new model(defaultTable, defaultOptions);
  await m.addMany(manyData);
  const ret = await m.aggregate({$unwind: '$tags'});
  t.assert.deepStrictEqual(ret, []);
});

test('createIndex', async t => {
  const m = new model(defaultTable, defaultOptions);
  await m.addMany(manyData);
  const ret = await m.createIndex('think');
  t.assert.deepStrictEqual(ret, 'think_1');
});

test('distinct', async t => {
  const m = new model(defaultTable, defaultOptions);
  await m.addMany(manyData);
  const ret = await m.distinct('name').select();
  const n = ret.filter(item => item === 'thinkjs').length;
  t.assert.strictEqual(n, 1);
});

test('transaction #2', async t => {
  const m = new model(defaultTable, defaultOptions);
  await m.transaction(async session => {
    await m.add({name: 'thinkjs'});
  }).catch(e => {});
  const ret = await m.select();
  t.assert.strictEqual(ret.length, 1);
});

test('transaction #3', async t => {
  const m = new model(defaultTable, defaultOptions);
  await m.transaction(async session => {
    await m.add({name: 'thinkjs'});
    throw Error('transaction failed');
  }).catch(e => {});
  const ret = await m.select();
  t.assert.strictEqual(ret.length, 0);
});

test('transaction failed with multi connection', async t => {
  const m = new model(defaultTable, defaultOptions);
  const n = new model(defaultTable, defaultOptions);
  await m.transaction(async session => {
    n.options.session = session;
    await m.add({name: 'thinkjs'});
    await n.add({name: 'thinkjs2'});
    throw Error('transaction failed');
  }).catch(e => {});
  const ret = await m.select();
  t.assert.strictEqual(ret.length, 0);
});

test('transaction with multi connection', async t => {
  const m = new model(defaultTable, defaultOptions);
  const n = new model(defaultTable, defaultOptions);
  await m.transaction(async session => {
    n.options.session = session;
    await m.add({name: 'thinkjs'});
    await n.add({name: 'thinkjs2'});
  }).catch(e => {});
  const ret = await m.select();
  t.assert.strictEqual(ret.length, 2);
});

test('transaction with update', async t => {
  const m = new model(defaultTable, defaultOptions);
  const n = new model(defaultTable, defaultOptions);
  await m.add({name: 'thinkjs'});
  await m.transaction(async session => {
    n.options.session = session;
    await n.where({name: 'thinkjs'}).update({name: 'thinkjs2'});
  }).catch(e => {});
  const ret = await m.select();
  t.assert.strictEqual(ret[0].name, 'thinkjs2');
});

test('transaction failed with update', async t => {
  const m = new model(defaultTable, defaultOptions);
  const n = new model(defaultTable, defaultOptions);
  await m.add({name: 'thinkjs'});
  await m.transaction(async session => {
    n.options.session = session;
    await n.where({name: 'thinkjs'}).update({name: 'thinkjs2'});
    throw Error('transaction failed');
  }).catch(e => {});
  const ret = await m.select();
  t.assert.strictEqual(ret[0].name, 'thinkjs');
});

test('transaction with delete', async t => {
  const m = new model(defaultTable, defaultOptions);
  const n = new model(defaultTable, defaultOptions);
  await m.add({name: 'thinkjs'});
  await m.transaction(async session => {
    n.options.session = session;
    await n.where({name: 'thinkjs'}).delete();
  }).catch(e => {});
  const ret = await m.select();
  t.assert.strictEqual(ret.length, 0);
});

test('transaction failed with delete', async t => {
  const m = new model(defaultTable, defaultOptions);
  const n = new model(defaultTable, defaultOptions);
  await m.add({name: 'thinkjs'});
  await m.transaction(async session => {
    n.options.session = session;
    await n.where({name: 'thinkjs'}).delete();
    throw Error('transaction failed');
  }).catch(e => {});
  const ret = await m.select();
  t.assert.strictEqual(ret.length, 1);
});