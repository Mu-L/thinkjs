const {test} = require('node:test');
const Relation = require('../../lib/relation/base');
test('instance normal', t => {
  t.plan(3);

  const relation = new Relation(1, 2, 3);
  t.assert.strictEqual(relation.data, 1);
  t.assert.strictEqual(relation.options, 2);
  t.assert.strictEqual(relation.model, 3);
});

test('relation where parse data object empty key', t => {
  const relation = new Relation({
    title: 'hello1',
    content: 'world1'
  }, {
    key: 'id',
    fkey: 'post_id'
  }, []);
  t.assert.strictEqual(relation.parseRelationWhere(), false);
});

test('relation where parse data object', t => {
  const relation = new Relation({
    id: 3,
    title: 'hello1',
    content: 'world1'
  }, {
    key: 'id',
    fKey: 'post_id'
  }, []);
  t.assert.deepStrictEqual(relation.parseRelationWhere(), {post_id: 3});
});

test('relation where parse data arr', t => {
  const relation = new Relation([{
    id: 3,
    title: 'hello1',
    content: 'world1'
  }, {
    id: '',
    title: 'hello2',
    content: 'world2'
  }], {
    key: 'id',
    fKey: 'post_id'
  }, []);
  t.assert.deepStrictEqual(relation.parseRelationWhere(), {post_id: ['IN', [3]]});
});

test('relation where parse data arr empty', t => {
  const relation = new Relation([{
    id: false,
    title: 'hello1',
    content: 'world1'
  }, {
    id: '',
    title: 'hello2',
    content: 'world2'
  }], {
    key: 'id',
    fKey: 'post_id'
  }, []);
  t.assert.strictEqual(relation.parseRelationWhere(), false);
});

test('relation data object', t => {
  t.plan(3);

  const relation = new Relation({
    title: 'hello1',
    content: 'world1'
  }, {
    name: 'user'
  }, []);

  t.assert.deepStrictEqual(
    relation.parseRelationData([{name: 'lizheming'}], true),
    {
      title: 'hello1',
      content: 'world1',
      user: [{name: 'lizheming'}]
    }
  );
  t.assert.deepStrictEqual(
    relation.parseRelationData([{name: 'lizheming'}], false),
    {
      title: 'hello1',
      content: 'world1',
      user: {name: 'lizheming'}
    }
  );
  t.assert.deepStrictEqual(
    relation.parseRelationData({name: 'lizheming'}, false),
    {
      title: 'hello1',
      content: 'world1',
      user: {}
    }
  );
});

test('relation data arr', t => {
  t.plan(2);

  const relation = new Relation([{
    id: 3,
    title: 'hello1',
    content: 'world1'
  }, {
    id: 10,
    title: 'hello2',
    content: 'world2'
  }], {
    key: 'id',
    fKey: 'post_id',
    name: 'user'
  }, []);

  t.assert.deepStrictEqual(relation.parseRelationData([
    {name: 'lizheming', post_id: 10},
    {name: 'lizheming1', post_id: 10},
    {name: 'lizheming', post_id: 3}
  ], true), [
    {
      id: 3,
      title: 'hello1',
      content: 'world1',
      user: [
        {name: 'lizheming', post_id: 3}
      ]
    },
    {
      id: 10,
      title: 'hello2',
      content: 'world2',
      user: [
        {name: 'lizheming', post_id: 10},
        {name: 'lizheming1', post_id: 10}
      ]
    }
  ]);

  t.assert.deepStrictEqual(relation.parseRelationData([
    {name: 'lizheming', post_id: 10},
    {name: 'lizheming1', post_id: 10},
    {name: 'lizheming', post_id: 3}
  ], false), [
    {
      id: 3,
      title: 'hello1',
      content: 'world1',
      user: {name: 'lizheming', post_id: 3}
    },
    {
      id: 10,
      title: 'hello2',
      content: 'world2',
      user: {name: 'lizheming1', post_id: 10}
    }
  ]);
});
