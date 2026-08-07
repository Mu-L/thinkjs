const {test} = require('node:test');
const Model = require('../lib/model');
const handle = require('think-model-abstract');

const db = new handle(new Model('test', {handle}));

test('model instance normal', t => {
  t.plan(3);

  const config = {
    handle
  };
  const modelName = 'post';
  const model = new Model(modelName, config);
  t.assert.strictEqual(model.modelName, modelName);
  t.assert.strictEqual(model.config, config);
  t.assert.deepStrictEqual(model.options, {});
});
test('model instance abnormal', t => {
  try {
    new Model({handle: 222});
    t.assert.fail();
  } catch (e) {
    t.assert.ok(true);
  }
});
test('model get db', t => {
  const config = {
    handle
  };
  const model = new Model(config);
  t.assert.strictEqual(model.db() instanceof config.handle, true);
});
test('model get models', t => {
  t.plan(2);
  const models = {post: {}};
  const model = new Model({handle});
  t.assert.deepStrictEqual(model.models, {});
  model.models = models;
  t.assert.strictEqual(model.models, models);
});
test('model get table prefix', t => {
  t.plan(2);

  t.assert.strictEqual((new Model({handle})).tablePrefix, '');

  const model = new Model({handle, prefix: 'fk_'});
  t.assert.strictEqual(model.tablePrefix, 'fk_');
});
test('model get table name', t => {
  t.plan(2);
  let model = new Model('post', {handle});
  t.assert.strictEqual(model.tableName, 'post');

  model = new Model('post', {handle, prefix: 'fk_'});
  t.assert.strictEqual(model.tableName, 'fk_post');
});
test('model get pk', t => {
  t.plan(2);
  const model = new Model({handle});
  t.assert.strictEqual(model.pk, 'id');
  model._pk = 'user_id';
  t.assert.strictEqual(model.pk, model._pk);
});
test('model get model inline', t => {
  t.plan(3);

  const model = new Model('post', {handle, prefix: 'fk_'});
  model.models = {
    'admin/user': function(tableName) {
      this.tableName = tableName;
    }
  };

  t.assert.strictEqual(model.model('user').tablePrefix, 'fk_');
  t.assert.strictEqual(model.model('user').models, model.models);
  t.assert.strictEqual(model.model('admin/user').tableName, 'user');
});
test('model set cache option', t => {
  t.plan(4);

  const model = new Model('post', {
    handle,
    cache: {
      type: 'file',
      handle: () => {}
    }
  });

  model.cache(500);
  t.assert.strictEqual(model.options.cache._keyTimeout, 500);
  model.cache('page', {timeout: 300});
  t.assert.strictEqual(model.options.cache.key, 'page');
  t.assert.strictEqual(model.options.cache._keyTimeout, 300);
  model.cache('page', {key: 'post'});
  t.assert.strictEqual(model.options.cache.key, 'post');
});
test('model set limit', t => {
  t.plan(6);

  const model = new Model('post', {handle});
  model.limit();
  t.assert.strictEqual(model.options.limit, undefined);
  model.limit([1]);
  t.assert.deepStrictEqual(model.options.limit, [1, undefined]);
  model.limit([1, 2]);
  t.assert.deepStrictEqual(model.options.limit, [1, 2]);
  model.limit(-1, -1);
  t.assert.deepStrictEqual(model.options.limit, [0, 0]);
  model.limit([-1, -10]);
  t.assert.deepStrictEqual(model.options.limit, [0, 0]);
  model.limit([]);
  t.assert.deepStrictEqual(model.options.limit, [0, undefined]);
});
test('model set page', t => {
  const model = new Model('post', {handle});
  model.page();
  t.assert.deepStrictEqual(model.options.limit, [0, 10]);
  model.page(0);
  t.assert.deepStrictEqual(model.options.limit, [0, 10]);
  model.page(2);
  t.assert.deepStrictEqual(model.options.limit, [10, 10]);
  model.page(0, 30);
  t.assert.deepStrictEqual(model.options.limit, [0, 30]);
  model.page([3, 20]);
  t.assert.deepStrictEqual(model.options.limit, [40, 20]);
});
test('model set where', t => {
  t.plan(4);

  const model = new Model('post', {handle});
  model.where();
  t.assert.strictEqual(model.options.where, undefined);
  model.where('hello');
  t.assert.strictEqual(model.options.where._string, 'hello');
  model.options.where = 'hello';
  model.where('123');
  t.assert.strictEqual(model.options.where._string, '123');
  delete model.options.where;
  model.where({id: ['>', 30]});
  t.assert.deepStrictEqual(model.options.where, {id: ['>', 30]});
});
test('model set field reverse', t => {
  t.plan(8);

  const model = new Model('post', {handle});
  model.field();
  t.assert.strictEqual(model.options.field, undefined);
  t.assert.strictEqual(model.options.fieldReverse, undefined);
  model.field('hello');
  t.assert.strictEqual(model.options.field, 'hello');
  t.assert.strictEqual(model.options.fieldReverse, false);
  model.field('hello', true);
  t.assert.strictEqual(model.options.field, 'hello');
  t.assert.strictEqual(model.options.fieldReverse, true);
  model.fieldReverse('hello2');
  t.assert.strictEqual(model.options.field, 'hello2');
  t.assert.strictEqual(model.options.fieldReverse, true);
});

test('model set table name', t => {
  t.plan(4);

  const model = new Model('post', {handle, prefix: 'fk_'});
  model.table();
  t.assert.strictEqual(model.options.table, undefined);
  model.table('  user  ');
  t.assert.strictEqual(model.options.table, 'fk_user');
  model.table('SELECT * FROM user');
  t.assert.strictEqual(model.options.table, 'SELECT * FROM user');
  model.table('user', true);
  t.assert.strictEqual(model.options.table, 'user');
});

test('model set union', t => {
  t.plan(3);

  const model = new Model('post', {handle});
  model.union();
  t.assert.strictEqual(model.options.union, undefined);
  model.union('test');
  t.assert.deepStrictEqual(model.options.union, [{union: 'test', all: false}]);
  model.union('test2', true);
  t.assert.deepStrictEqual(model.options.union, [{union: 'test', all: false}, {union: 'test2', all: true}]);
});

test('model set join', t => {
  t.plan(3);

  const model = new Model('post', {handle});
  model.join();
  t.assert.strictEqual(model.options.join, undefined);
  model.join(222);
  t.assert.deepStrictEqual(model.options.join, [222]);
  model.join([1, 2, 3, 4]);
  t.assert.deepStrictEqual(model.options.join, [222, 1, 2, 3, 4]);
});

test('model set order alias having group lock auto explan distinct', t => {
  t.plan(9);

  const model = new Model('post', {handle});
  t.assert.strictEqual(model.order('id').options.order, 'id');
  t.assert.strictEqual(model.alias('user').options.alias, 'user');
  t.assert.strictEqual(model.having('user').options.having, 'user');
  t.assert.strictEqual(model.group('user').options.group, 'user');
  t.assert.strictEqual(model.lock('user').options.lock, 'user');
  t.assert.strictEqual(model.auto('user').options.auto, 'user');
  t.assert.strictEqual(model.explain('user').options.explain, 'user');
  t.assert.strictEqual(model.distinct('user').options.field, 'user');
  t.assert.deepStrictEqual(model.distinct({field: 'user'}).options.distinct, {field: 'user'});
});

test('model parse options', async t => {
  t.plan(4);
  const adapter = function() {};
  adapter.prototype.getReverseFields = function() {
    return ['id', 'name', 'title'];
  };

  const model = new Model('post', {handle: adapter});

  t.assert.deepStrictEqual(
    await model.parseOptions(3),
    {table: 'post', pk: 'id', tablePrefix: '', where: {id: '3'}}
  );
  t.assert.deepStrictEqual(
    await model.parseOptions('3,4'),
    {table: 'post', pk: 'id', tablePrefix: '', where: {id: {IN: '3,4'}}}
  );
  t.assert.deepStrictEqual(
    await model.parseOptions({table: 'user', where: {id: 3}}),
    {table: 'user', pk: 'id', tablePrefix: '', where: {id: 3}}
  );

  model.config.prefix = 'fk_';
  model.options = {
    field: 'title',
    fieldReverse: true
  };
  t.assert.deepStrictEqual(
    await model.parseOptions(),
    {table: 'fk_post', pk: 'id', tablePrefix: 'fk_', field: ['id', 'name', 'title']}
  );
});

test('model add data', async t => {
  t.plan(2);

  const adapter = class {
    add() {
      return 3;
    }
    parseData(data) {
      return data;
    }
  };

  const model = new Model('post', {handle: adapter});
  try {
    await model.add();
    t.assert.fail();
  } catch (e) {
    t.assert.ok(true);
  };

  const result = await model.add({title: 'hello', content: 'hello world'});
  t.assert.strictEqual(result, 3);
});

test('model then add data', async t => {
  t.plan(3);

  const model = new Model('post', {handle: class {
    add(data) {
      t.assert.deepStrictEqual(data, {title: 'hello2', content: 'hello world again!'});
      return 2;
    }
    parseData(data) {
      return data;
    }
  }});
  model.find = function() {
    if (this.options.where.id === 1) {
      return {id: 1, title: 'hello', content: 'hello world'};
    }
    return {};
  };

  let result = await model.thenAdd({title: 'hello2', content: 'hello world again!'}, {id: 1});
  t.assert.deepStrictEqual(result, {type: 'exist', id: 1});

  result = await model.thenAdd({title: 'hello2', content: 'hello world again!'}, {id: 2});
  t.assert.deepStrictEqual(result, {type: 'add', id: 2});
});

test('model then update data exist', async t => {
  t.plan(2);

  const model = new Model('post', {handle});
  model.find = function() {
    return {id: 1, title: 'test', content: 'world'};
  };
  model.update = function(data) {
    t.assert.strictEqual(this.options.where.id, 1);
    return {id: 1, title: 'hello', content: 'world'};
  };
  const result = await model.thenUpdate({title: 'hello'}, {id: 1});
  t.assert.deepStrictEqual(result, 1);
});

test('model then update data not exist', async t => {
  t.plan(2);

  const model = new Model('post', {handle});
  model.find = function() {
    t.assert.strictEqual(this.options.where.id, 3);
    return {};
  };
  model.add = function(data) {
    return 4;
  };
  const result = await model.thenUpdate({title: 'hello', content: 'world'}, {id: 3});
  t.assert.strictEqual(result, 4);
});

test('model add many data error', async t => {
  t.plan(2);

  const model = new Model('post', {handle: class {
    parseData(data) {
      return data;
    }
    addMany() {
      return [1, 2, 3, 4];
    }
  }});

  try {
    await model.addMany({title: 'hello'});
  } catch (e) {
    t.assert.ok(true);
  }

  try {
    await model.addMany([1, 2]);
  } catch (e) {
    t.assert.ok(true);
  }
});

test('model add many data', async t => {
  t.plan(6);

  const model = new Model('post', {handle: class {
    parseData(data) {
      return data;
    }
    addMany(data) {
      t.assert.strictEqual(data.every(d => d.user === 'lizheming'), true);
      return [1, 2, 3, 4];
    }
  }});

  const addData = [
    {title: 'hello', content: 'world'},
    {title: 'hello1', content: 'world1'},
    {title: 'hello2', content: 'world2'},
    {title: 'hello3', content: 'world3'}
  ];
  model.beforeAdd = function(data) {
    data.user = 'lizheming';
    return data;
  };
  model.afterAdd = function(data) {
    t.assert.strictEqual(data.hasOwnProperty('id'), true);
  };
  const result = await model.addMany(addData);
  t.assert.deepStrictEqual(result, [1, 2, 3, 4]);
});

test('model delete data', async t => {
  t.plan(3);
  const model = new Model('post', {handle: class {
    delete(options) {
      return 1;
    }
  }});

  const options = {id: 3};

  model.beforeDelete = model.afterDelete = function(opt) {
    t.assert.strictEqual(opt.id, options.id);
    return opt;
  };

  const result = await model.delete(options);
  t.assert.strictEqual(result, 1);
});

test('model update data', async t => {
  t.plan(6);

  const model = new Model('post', {handle: class {
    parseData(data, isUpdate) {
      t.assert.strictEqual(isUpdate, true);
      return data;
    }
    update(data, options) {
      t.assert.deepStrictEqual(options.where, {id: 3});
      t.assert.deepStrictEqual(data, {title: 'hello'});
      return 'update data';
    }
  }});

  try {
    await model.update({title: 'hello'});
  } catch (e) {
    t.assert.ok(true);
  }

  const result = await model.update({title: 'hello', id: 3});
  t.assert.strictEqual(result, 'update data');
});

test('model updateMany data error', async t => {
  const model = new Model('post', {handle: class {
    parseData(data) {
      return data;
    }
    update() {
      return true;
    }
  }});

  try {
    await model.updateMany({id: 3, title: 'hello'});
    t.assert.fail();
  } catch (e) {
    t.assert.deepStrictEqual(model.options, {});
  }
});

test('updateMany has no pk', async t => {
  const model = new Model('post', {handle: class {
    parseData(data) {
      return data;
    }
    update() {
      return true;
    }
  }});

  try {
    await model.updateMany([{title: 'hello'}]);
    t.assert.fail();
  } catch (e) {
    t.assert.deepStrictEqual(model.options, {});
  }
});

test('updateMany normal', async t => {
  t.plan(5);

  const model = new Model('post', {handle: class {
    parseData(data) {
      return data;
    }
  }});
  model.update = function(data, options) {
    if (data.id === 3) {
      t.assert.deepStrictEqual(data, {id: 3, title: 'hello1', content: 'world1'});
    } else {
      t.assert.deepStrictEqual(data, {id: 10, title: 'hello2', content: 'world2'});
    }
    t.assert.deepStrictEqual(options, {});
    return data.id;
  };
  const result = await model.updateMany([
    {id: 3, title: 'hello1', content: 'world1'},
    {id: 10, title: 'hello2', content: 'world2'}
  ], {});
  t.assert.deepStrictEqual(result, [3, 10]);
});

test('model find data', async t => {
  t.plan(5);

  const options = {
    pk: 'id',
    limit: 1,
    table: 'post',
    tablePrefix: '',
    where: {
      id: 3
    }
  };
  const data = {title: 'hello', content: 'world'};
  const model = new Model('post', {handle: class {
    select(opt) {
      t.assert.deepStrictEqual(opt, options);
      return [data];
    }
  }});

  model.beforeFind = function(opt) {
    t.assert.deepStrictEqual(opt, options);
    return opt;
  };
  model.afterFind = function(findData, opt) {
    t.assert.deepStrictEqual(findData, data);
    t.assert.deepStrictEqual(opt, options);
    return findData;
  };
  const result = await model.where({id: 3}).limit([0, 10]).find();
  t.assert.deepStrictEqual(result, data);
});

test('model select data', async t => {
  t.plan(5);

  const options = {
    pk: 'id',
    table: 'post',
    tablePrefix: '',
    where: {
      id: ['>', 10]
    }
  };
  const data = [{title: 'hello', content: 'world'}];
  const model = new Model('post', {handle: class {
    select(opt) {
      t.assert.deepStrictEqual(opt, options);
      return data;
    }
  }});
  model.beforeSelect = function(opt) {
    t.assert.deepStrictEqual(opt, options);
    return opt;
  };
  model.afterSelect = function(selectData, opt) {
    t.assert.deepStrictEqual(selectData, data);
    t.assert.deepStrictEqual(opt, options);
    return selectData;
  };
  const result = await model.where({id: ['>', 10]}).select();
  t.assert.deepStrictEqual(result, data);
});

test.todo('selectAdd');

test.todo('countSelect');

test('model get field normal', async t => {
  t.plan(2);

  const model = new Model('post', {handle: class {
    select(options) {
      t.assert.deepStrictEqual(options, {
        pk: 'id',
        table: 'post',
        tablePrefix: '',
        field: 'content, title'
      });

      return [
        {title: 'hello1', content: 'world1'},
        {title: 'hello2', content: 'world2'}
      ];
    }
  }});

  const result = await model.getField('content, title');
  t.assert.deepStrictEqual(result, {
    title: ['hello1', 'hello2'],
    content: ['world1', 'world2']
  });
});

test('model get field one data', async t => {
  t.plan(2);

  const model = new Model('post', {handle: class {
    select(options) {
      t.assert.deepStrictEqual(options, {
        pk: 'id',
        limit: 1,
        table: 'post',
        tablePrefix: '',
        field: 'content, title'
      });

      return [
        {title: 'hello1', content: 'world1'}
      ];
    }
  }});

  const result = await model.getField('content, title', true);
  t.assert.deepStrictEqual(result, {
    title: 'hello1',
    content: 'world1'
  });
});

test('model get field no data 1', async t => {
  t.plan(1);

  const model = new Model('post', {handle: class {
    select(options) {
      return [];
    }
  }});

  const result = await model.getField('content, title', true);
  t.assert.deepStrictEqual(result, {
    title: undefined,
    content: undefined
  });
});

test('model get field no data 2', async t => {
  t.plan(1);

  const model = new Model('post', {handle: class {
    select(options) {
      return [];
    }
  }});

  const result = await model.getField('content', true);
  t.assert.deepStrictEqual(result, undefined);
});

test('model get field no data 3', async t => {
  t.plan(1);

  const model = new Model('post', {handle: class {
    select(options) {
      return [];
    }
  }});

  const result = await model.getField('content');
  t.assert.deepStrictEqual(result, []);
});

test('model get field no data 3 #2', async t => {
  t.plan(1);

  const model = new Model('post', {handle: class {
    select(options) {
      return [];
    }
  }});

  const result = await model.getField('content,title');
  t.assert.deepStrictEqual(result, {
    title: [],
    content: []
  });
});

test('model get field one key', async t => {
  t.plan(2);

  const model = new Model('post', {handle: class {
    select(options) {
      t.assert.deepStrictEqual(options, {
        pk: 'id',
        table: 'post',
        tablePrefix: '',
        field: 'title'
      });

      return [
        {title: 'hello1'},
        {title: 'hello2'}
      ];
    }
  }});

  const result = await model.getField('title');
  t.assert.deepStrictEqual(result, ['hello1', 'hello2']);
});

test('model get field one data one key', async t => {
  t.plan(2);

  const model = new Model('post', {handle: class {
    select(options) {
      t.assert.deepStrictEqual(options, {
        pk: 'id',
        limit: 1,
        table: 'post',
        tablePrefix: '',
        field: 'title,content'
      });

      return [
        {title: 'hello2', content: 'world2'}
      ];
    }
  }});

  const result = await model.getField('title,content', true);
  t.assert.deepStrictEqual(result, {title: 'hello2', content: 'world2'});
});

test('model increment', async t => {
  t.plan(12);
  const model = new Model('post', {handle});
  model.db(db);

  const arr = ['count', 'view'];
  const obj = {count: 3, view: 4};
  const str = 'count';
  const arrData = (step = 1) => ({
    count: ['exp', 'count+' + step],
    view: ['exp', 'view+' + step]
  });
  const objData = () => ({
    count: ['exp', 'count+3'],
    view: ['exp', 'view+4']
  });
  const strData = (step = 1) => ({
    count: ['exp', 'count+' + step]
  });

  for (const step of [1, 10]) {
    let time = 0;

    model.update = function(data) {
      if (time === 0) {
        t.assert.deepStrictEqual(data, arrData(step));
        return arrData(step);
      } else if (time === 1) {
        t.assert.deepStrictEqual(data, objData());
        return objData();
      } else {
        t.assert.deepStrictEqual(data, strData(step));
        return strData(step);
      }
    };
    t.assert.deepStrictEqual(
      await model.increment(arr, step),
      arrData(step)
    );
    time = 1;
    t.assert.deepStrictEqual(
      await model.increment(obj, step),
      objData()
    );
    time = 2;
    t.assert.deepStrictEqual(
      await model.increment(str, step),
      strData(step)
    );
  }
});

test('model decrement', async t => {
  t.plan(12);
  const model = new Model('post', {handle});
  model.db(db);

  const arr = ['count', 'view'];
  const obj = {count: 3, view: 4};
  const str = 'count';
  const arrData = (step = 1) => ({
    count: ['exp', 'count-' + step],
    view: ['exp', 'view-' + step]
  });
  const objData = () => ({
    count: ['exp', 'count-3'],
    view: ['exp', 'view-4']
  });
  const strData = (step = 1) => ({
    count: ['exp', 'count-' + step]
  });

  for (const step of [1, 10]) {
    let time = 0;

    model.update = function(data) {
      if (time === 0) {
        t.assert.deepStrictEqual(data, arrData(step));
        return arrData(step);
      } else if (time === 1) {
        t.assert.deepStrictEqual(data, objData());
        return objData();
      } else {
        t.assert.deepStrictEqual(data, strData(step));
        return strData(step);
      }
    };
    t.assert.deepStrictEqual(
      await model.decrement(arr, step),
      arrData(step)
    );
    time = 1;
    t.assert.deepStrictEqual(
      await model.decrement(obj, step),
      objData()
    );
    time = 2;
    t.assert.deepStrictEqual(
      await model.decrement(str, step),
      strData(step)
    );
  }
});

for (const logic of ['count', 'sum', 'min', 'max', 'avg']) {
  test(`model ${logic} empty`, t => {
    const model = new Model('post', {handle});
    model.db(db);
    model.getField = function(sql) {
      t.assert.strictEqual(sql, `${logic.toUpperCase()}(*) AS think_${logic}`);
    };
    model[logic]();
  });
  test(`model ${logic} custom pk`, t => {
    const model = new Model('post', {handle});
    model.db(db);
    model._pk = 'post_id';
    model.getField = function(sql) {
      t.assert.strictEqual(sql, `${logic.toUpperCase()}(*) AS think_${logic}`);
    };
    model[logic]();
  });
  test(`model ${logic} empty pk`, t => {
    const model = new Model('post', {handle});
    model.db(db);
    Object.defineProperty(model, 'pk', {value: false});
    model.getField = function(sql) {
      t.assert.strictEqual(sql, `${logic.toUpperCase()}(*) AS think_${logic}`);
    };
    model[logic]();
  });
  test(`model ${logic} with field`, t => {
    const model = new Model('post', {handle});
    model.db(db);
    Object.defineProperty(model, 'pk', {value: false});
    model.getField = function(sql) {
      t.assert.strictEqual(sql, `${logic.toUpperCase()}(title) AS think_${logic}`);
    };
    model[logic]('title');
  });
}

test('model query method', async t => {
  t.plan(3);

  const options = {table: 'post', where: {id: ['>', 30]}};
  const model = new Model('post', {handle: class {
    select(opt, c) {
      t.assert.strictEqual(opt, options);
      return 'select return';
    }
  }});
  model.parseSql = function(opt) {
    t.assert.strictEqual(opt, options);
    return opt;
  };
  const result = await model.query(options);
  t.assert.strictEqual(result, 'select return');
});

test('model excute method', async t => {
  t.plan(3);

  const options = {table: 'post', where: {id: ['>', 30]}};
  const model = new Model('post', {handle: class {
    execute(opt, c) {
      t.assert.strictEqual(opt, options);
      return 'select return';
    }
  }});
  model.parseSql = function(opt) {
    t.assert.strictEqual(opt, options);
    return opt;
  };
  const result = await model.execute(options);
  t.assert.strictEqual(result, 'select return');
});

test('model parser sql', t => {
  const model = new Model('post', {
    handle,
    prefix: 'fk_'
  });
  model.db(db);

  const result = model.parseSql('__TABLE__  __TABLE__  __TITLE__ __title__');
  t.assert.strictEqual(result.sql, ' fk_post  fk_post  fk_title __title__');
});
test('set db 2', t => {
  const model = new Model('post', {
    handle,
    prefix: 'fk_'
  });
  const db1 = model.db();
  const db2 = model.db();
  t.assert.strictEqual(db1, db2);
});

test('set db 3', t => {
  const model1 = new Model('post', {
    handle,
    prefix: 'fk_'
  });
  const model2 = new Model('post2', {
    handle,
    prefix: 'fk_'
  });
  const db1 = model1.db();
  model2.db(db1);
  const db2 = model2.db();
  t.assert.strictEqual(db1 === db2, false);
});

test('set db 4', t => {
  const model1 = new Model('post', {
    handle,
    prefix: 'fk_'
  });
  const model2 = new Model('post2', {
    handle,
    prefix: 'fk_'
  });
  const db1 = model1.db();
  model2.db(db1);
  const db2 = model2.db();
  t.assert.strictEqual(db1.query, db2.query);
});
