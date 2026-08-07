const {test} = require('node:test');
const helper = require('think-helper');
const Parser = require('../../lib/parser');

const getParserInstance = config => {
  const instance = new Parser(config);
  instance.parseKey = function parseKey(key = '') {
    key = key.trim();
    if (helper.isEmpty(key)) return '';
    if (helper.isNumberString(key)) return key;
    if (!(/[,'"*()`.\s]/.test(key))) {
      key = '`' + key + '`';
    }
    return key;
  };
  return instance;
};

test('init', ('init', t => {
  t.plan(2);
  const instance = getParserInstance();
  // const keys = Object.keys(instance.comparison).sort();
  // t.deepEqual(keys, [ '<>', 'EGT', 'ELT', 'EQ', 'GT', 'ILIKE', 'IN', 'LIKE', 'LT', 'NEQ', 'NOTILIKE', 'NOTIN', 'NOTLIKE' ]);
  t.assert.strictEqual(instance.selectSql, undefined);
  t.assert.strictEqual(instance.comparison, undefined);
}));

test('parseExplain', t => {
  const instance = getParserInstance();
  const data = instance.parseExplain();
  t.assert.strictEqual(data, '');
});

test('parseExplain true', t => {
  const instance = getParserInstance();
  const data = instance.parseExplain(true);
  t.assert.strictEqual(data, 'EXPLAIN ');
});

test('parseSet', t => {
  const instance = getParserInstance();
  const data = instance.parseSet({
    name: 'lizheming'
  });
  t.assert.strictEqual(data, " SET `name`='lizheming'");
});

test('parseSet, has extra value', t => {
  const instance = getParserInstance();
  const data = instance.parseSet({
    name: 'lizheming',
    value: ['array']
  });
  t.assert.strictEqual(data, " SET `name`='lizheming'");
});

test('parseSet, empty', t => {
  const instance = getParserInstance();
  const data = instance.parseSet();
  t.assert.strictEqual(data, '');
});

test('parseKey is function', t => {
  const instance = getParserInstance();
  const key = instance.parseKey('key');
  t.assert.strictEqual(key, '`key`');
});

test('parseKey is function 2', t => {
  const instance = getParserInstance();
  const key = instance.parseKey('key()');
  t.assert.strictEqual(key, 'key()');
});

test('parseValue, string', t => {
  const instance = getParserInstance();
  const key = instance.parseValue('key');
  t.assert.strictEqual(key, "'key'");
});

test('parseValue, array, exp', t => {
  const instance = getParserInstance();
  const key = instance.parseValue(['exp', 'lizheming']);
  t.assert.strictEqual(key, 'lizheming');
});

test('parseValue, array, exp #2', t => {
  const instance = getParserInstance();
  const key = instance.parseValue(['exp', 'lizhemi()ng']);
  t.assert.strictEqual(key, 'lizhemi()ng');
});

test('parseValue, null', t => {
  const instance = getParserInstance();
  const key = instance.parseValue(null);
  t.assert.strictEqual(key, 'null');
});

test('parseValue, boolean, true', t => {
  const instance = getParserInstance();
  const key = instance.parseValue(true);
  t.assert.strictEqual(key, '1');
});

test('parseValue, boolean, false', t => {
  const instance = getParserInstance();
  const key = instance.parseValue(false);
  t.assert.strictEqual(key, '0');
});

test('parseValue, object', t => {
  const instance = getParserInstance();
  const key = instance.parseValue({});
  t.assert.deepStrictEqual(key, {});
});

test('parseValue, buffer', t => {
  const instance = getParserInstance();
  const key = instance.parseValue(Buffer.from([1, 2, 3, 4, 255]));
  t.assert.strictEqual(key, "X'01020304ff'");
});

test('parseField, empty', t => {
  const instance = getParserInstance();
  const key = instance.parseField();
  t.assert.deepStrictEqual(key, '*');
});

test('parseField, empty array', t => {
  const instance = getParserInstance();
  const key = instance.parseField([]);
  t.assert.deepStrictEqual(key, '*');
});


test('parseField, empty object', t => {
  const instance = getParserInstance();
  const key = instance.parseField({});
  t.assert.deepStrictEqual(key, '*');
});


test('parseField, single field', t => {
  const instance = getParserInstance();
  const key = instance.parseField('name');
  t.assert.deepStrictEqual(key, '`name`');
});

test('parseField, string field with alias', t => {
  const instance = getParserInstance();
  const key = instance.parseField('name', {
    alias: 'u'
  });
  t.assert.deepStrictEqual(key, '`u`.`name`');
});

test('parseField, single field with ()', t => {
  const instance = getParserInstance();
  const key = instance.parseField('(name)');
  t.assert.deepStrictEqual(key, '(name)');
});

test('parseField, multi field', t => {
  const instance = getParserInstance();
  const key = instance.parseField('name,title');
  t.assert.deepStrictEqual(key, '`name`,`title`');
});

test('parseField, multi field #2', t => {
  const instance = getParserInstance();
  const key = instance.parseField('name, title');
  t.assert.deepStrictEqual(key, '`name`,`title`');
});

test('parseField, array', t => {
  const instance = getParserInstance();
  const key = instance.parseField(['name', 'title'], { alias: 'u' });
  t.assert.deepStrictEqual(key, '`u`.`name`,`u`.`title`');
});

test('parseField, object', t => {
  const instance = getParserInstance();
  const key = instance.parseField({
    name: 'name',
    title1: 'title'
  });
  t.assert.deepStrictEqual(key, '`name` AS `name`,`title1` AS `title`');
});

test('parseTable, empty', t => {
  const instance = getParserInstance();
  const key = instance.parseTable();
  t.assert.deepStrictEqual(key, '');
});

test('parseTable, string', t => {
  const instance = getParserInstance();
  const key = instance.parseTable('user');
  t.assert.deepStrictEqual(key, '`user`');
});

test('parseTable, string with alias', t => {
  const instance = getParserInstance();
  const key = instance.parseTable('user', { alias: 'u' });
  t.assert.deepStrictEqual(key, '`user` AS u');
});

test('parseTable, string, multi', t => {
  const instance = getParserInstance();
  const key = instance.parseTable('user, group');
  t.assert.deepStrictEqual(key, '`user`,`group`');
});

test('parseTable, object', t => {
  const instance = getParserInstance();
  const key = instance.parseTable({
    user: 'user1',
    group: 'group1'
  });
  t.assert.deepStrictEqual(key, '`user` AS `user1`,`group` AS `group1`');
});

test('getLogic', t => {
  const instance = getParserInstance();
  const key = instance.getLogic({});
  t.assert.deepStrictEqual(key, 'AND');
});

test('getLogic, has _logic', t => {
  const instance = getParserInstance();
  const key = instance.getLogic({
    _logic: 'OR'
  });
  t.assert.deepStrictEqual(key, 'OR');
});

test('getLogic, has _logic, error', t => {
  const instance = getParserInstance();
  const key = instance.getLogic({
    _logic: 'test'
  });
  t.assert.deepStrictEqual(key, 'AND');
});

test('getLogic, default is OR', t => {
  const instance = getParserInstance();
  const key = instance.getLogic({}, 'OR');
  t.assert.deepStrictEqual(key, 'OR');
});

test('getLogic, string', t => {
  const instance = getParserInstance();
  const key = instance.getLogic('AND', 'OR');
  t.assert.deepStrictEqual(key, 'AND');
});

test('getLogic, string, lowercase', t => {
  const instance = getParserInstance();
  const key = instance.getLogic('and', 'OR');
  t.assert.deepStrictEqual(key, 'AND');
});

test('escapeString is function', t => {
  const instance = getParserInstance();
  t.assert.strictEqual(helper.isFunction(instance.escapeString), true);
});

test('parseLock, empty', t => {
  const instance = getParserInstance();
  const data = instance.parseLock();
  t.assert.strictEqual(data, '');
});

test('parseLock, true', t => {
  const instance = getParserInstance();
  const data = instance.parseLock(true);
  t.assert.strictEqual(data, ' FOR UPDATE ');
});

test('parseDistinct, empty', t => {
  const instance = getParserInstance();
  const data = instance.parseDistinct();
  t.assert.strictEqual(data, '');
});

test('parseDistinct, true', t => {
  const instance = getParserInstance();
  const data = instance.parseDistinct(true);
  t.assert.strictEqual(data, ' DISTINCT');
});

test('parseComment, empty', t => {
  const instance = getParserInstance();
  const data = instance.parseComment();
  t.assert.strictEqual(data, '');
});

test('parseComment, lizheming test', t => {
  const instance = getParserInstance();
  const data = instance.parseComment('lizheming test');
  t.assert.strictEqual(data, ' /*lizheming test*/');
});

test('parseHaving, empty', t => {
  const instance = getParserInstance();
  const data = instance.parseHaving();
  t.assert.strictEqual(data, '');
});

test('parseHaving, SUM(area)>1000000', t => {
  const instance = getParserInstance();
  const data = instance.parseHaving('SUM(area)>1000000');
  t.assert.strictEqual(data, ' HAVING SUM(area)>1000000');
});

test('parseGroup, empty', t => {
  const instance = getParserInstance();
  const data = instance.parseGroup();
  t.assert.strictEqual(data, '');
});

test('parseGroup, name', t => {
  const instance = getParserInstance();
  const data = instance.parseGroup('name');
  t.assert.strictEqual(data, ' GROUP BY `name`');
});

test('parseGroup, name #2', t => {
  const instance = getParserInstance();
  const data = instance.parseGroup("date_format(create_time,'%Y-%m-%d')");
  t.assert.strictEqual(data, " GROUP BY date_format(create_time,'%Y-%m-%d')");
});

test('parseGroup, name,title', t => {
  const instance = getParserInstance();
  const data = instance.parseGroup('name, title');
  t.assert.strictEqual(data, ' GROUP BY `name`,`title`');
});

test('parseGroup, user.name,title', t => {
  const instance = getParserInstance();
  const data = instance.parseGroup(['user.name', 'title']);
  t.assert.strictEqual(data, ' GROUP BY user.`name`,`title`');
});

test('parseOrder, empty', t => {
  const instance = getParserInstance();
  const data = instance.parseOrder();
  t.assert.strictEqual(data, '');
});

test('parseOrder, array', t => {
  const instance = getParserInstance();
  const data = instance.parseOrder(['name ASC', 'title DESC']);
  t.assert.strictEqual(data, ' ORDER BY name ASC,title DESC');
});

test('parseOrder, string', t => {
  const instance = getParserInstance();
  const data = instance.parseOrder('name ASC,title DESC');
  t.assert.strictEqual(data, ' ORDER BY name ASC,title DESC');
});

test('parseOrder, object', t => {
  const instance = getParserInstance();
  const data = instance.parseOrder({ name: 'ASC', 'title': 'DESC' });
  t.assert.strictEqual(data, ' ORDER BY `name` ASC,`title` DESC');
});

test('parseLimit, empty', t => {
  const instance = getParserInstance();
  const data = instance.parseLimit();
  t.assert.strictEqual(data, '');
});

test('parseLimit, 10', t => {
  const instance = getParserInstance();
  const data = instance.parseLimit('10');
  t.assert.strictEqual(data, ' LIMIT 10');
});

test('parseLimit, number', t => {
  const instance = getParserInstance();
  const data = instance.parseLimit(10);
  t.assert.strictEqual(data, ' LIMIT 10');
});

test('parseLimit, 10, 20', t => {
  const instance = getParserInstance();
  const data = instance.parseLimit('10, 20');
  t.assert.strictEqual(data, ' LIMIT 10,20');
});

test('parseLimit, 10, lizheming', t => {
  const instance = getParserInstance();
  const data = instance.parseLimit('10, lizheming');
  t.assert.strictEqual(data, ' LIMIT 10,0');
});

test('parseLimit, [20, 10]', t => {
  const instance = getParserInstance();
  const data = instance.parseLimit([20, 10]);
  t.assert.strictEqual(data, ' LIMIT 20,10');
});

test('parseJoin, empty', t => {
  const instance = getParserInstance();
  const data = instance.parseJoin();
  t.assert.strictEqual(data, '');
});

test('parseJoin, single string', t => {
  const instance = getParserInstance();
  const data = instance.parseJoin('meinv_cate ON meinv_group.cate_id=meinv_cate.id');
  t.assert.strictEqual(data, ' LEFT JOIN meinv_cate ON meinv_group.cate_id=meinv_cate.id');
});

test('parseJoin, multi string', t => {
  const instance = getParserInstance();
  const data = instance.parseJoin(['meinv_cate ON meinv_group.cate_id=meinv_cate.id', 'RIGHT JOIN meinv_tag ON meinv_group.tag_id=meinv_tag.id']);
  t.assert.strictEqual(data, ' LEFT JOIN meinv_cate ON meinv_group.cate_id=meinv_cate.id RIGHT JOIN meinv_tag ON meinv_group.tag_id=meinv_tag.id');
});

test('parseJoin, array', t => {
  const instance = getParserInstance();
  const data = instance.parseJoin([{
    table: 'cate',
    join: 'inner',
    as: 'c',
    on: ['cate_id', 'id']
  }], {
    tablePrefix: '',
    table: 'user'
  });
  t.assert.strictEqual(data, ' INNER JOIN `cate` AS `c` ON `user`.`cate_id` = `c`.`id`');
});

test('parseJoin, array #2', t => {
  const instance = getParserInstance();
  const data = instance.parseJoin([{
    table: 'cate',
    join: 'inner',
    as: 'c',
    on: {
      'user.cate_id': 'id',
      cate_id: ['EXP', ' > 100']
    }
  }], {
    tablePrefix: '',
    table: 'user'
  });
  t.assert.strictEqual(data, ' INNER JOIN `cate` AS `c` ON (user.cate_id=`c`.`id` AND `user`.`cate_id` > 100)');
});

test('parseJoin, array, no on', t => {
  const instance = getParserInstance();
  const data = instance.parseJoin([{
    table: 'cate',
    join: 'inner',
    as: 'c'
  }], {
    tablePrefix: '',
    table: 'user'
  });
  t.assert.strictEqual(data, ' INNER JOIN `cate` AS `c`');
});

test('parseJoin, array, no on table with .', t => {
  const instance = getParserInstance();
  const data = instance.parseJoin([{
    table: 'db2.cate',
    join: 'inner',
    as: 'c'
  }], {
    tablePrefix: '',
    table: 'user'
  });
  t.assert.strictEqual(data, ' INNER JOIN db2.cate AS `c`');
});

test('parseJoin, array, ignore not object', t => {
  const instance = getParserInstance();
  const data = instance.parseJoin([{
    table: 'cate',
    join: 'inner',
    as: 'c'
  }, true], {
    tablePrefix: '',
    table: 'user'
  });
  t.assert.strictEqual(data, ' INNER JOIN `cate` AS `c`');
});

test('parseJoin, array, multi', t => {
  const instance = getParserInstance();
  const data = instance.parseJoin([{
    table: 'cate',
    join: 'left',
    as: 'c',
    on: ['cate_id', 'id']
  }, {
    table: 'group_tag',
    join: 'left',
    as: 'd',
    on: ['id', 'group_id']
  }], {
    tablePrefix: '',
    table: 'user'
  });
  t.assert.strictEqual(data, ' LEFT JOIN `cate` AS `c` ON `user`.`cate_id` = `c`.`id` LEFT JOIN `group_tag` AS `d` ON `user`.`id` = `d`.`group_id`');
});

test('parseJoin, array, multi 1', t => {
  const instance = getParserInstance();
  const data = instance.parseJoin([{
    cate: {
      join: 'left',
      as: 'c',
      on: ['id', 'id']
    },
    group_tag: {
      join: 'left',
      as: 'd',
      on: ['id', 'group_id']
    }
  }], {
    tablePrefix: '',
    table: 'user'
  });

  t.assert.strictEqual(data, ' LEFT JOIN `cate` AS `c` ON `user`.`id` = `c`.`id` LEFT JOIN `group_tag` AS `d` ON `user`.`id` = `d`.`group_id`');
});

test('parseJoin, array, multi 2', t => {
  const instance = getParserInstance();
  const data = instance.parseJoin([{
    cate: {
      on: ['id', 'id']
    },
    group_tag: {
      on: ['id', 'group_id']
    }
  }], {
    tablePrefix: '',
    table: 'user'
  });
  t.assert.strictEqual(data, ' LEFT JOIN `cate` ON `user`.`id` = `cate`.`id` LEFT JOIN `group_tag` ON `user`.`id` = `group_tag`.`group_id`');
});

test('parseJoin, array, multi 3', t => {
  const instance = getParserInstance();
  const data = instance.parseJoin([{
    cate: {
      on: 'id, id'
    },
    group_tag: {
      on: ['id', 'group_id']
    },
    tag: {
      on: {
        id: 'id',
        title: 'name'
      }
    }
  }], {
    tablePrefix: '',
    table: 'user'
  });
  t.assert.strictEqual(data, ' LEFT JOIN `cate` ON `user`.`id` = `cate`.`id` LEFT JOIN `group_tag` ON `user`.`id` = `group_tag`.`group_id` LEFT JOIN `tag` ON (`user`.`id`=`tag`.`id` AND `user`.`title`=`tag`.`name`)');
});

test('parseJoin, array, multi 4, on has table name', t => {
  const instance = getParserInstance();
  const data = instance.parseJoin([{
    cate: {
      on: 'id, id'
    },
    group_tag: {
      on: ['id', 'group_id']
    },
    tag: {
      on: {
        id: 'id',
        title: 'tag.name'
      }
    }
  }], {
    tablePrefix: '',
    table: 'user'
  });
  t.assert.strictEqual(data, ' LEFT JOIN `cate` ON `user`.`id` = `cate`.`id` LEFT JOIN `group_tag` ON `user`.`id` = `group_tag`.`group_id` LEFT JOIN `tag` ON (`user`.`id`=`tag`.`id` AND `user`.`title`=tag.name)');
});

test('parseJoin, array, multi 4, on has table name 1', t => {
  const instance = getParserInstance();
  const data = instance.parseJoin([{
    cate: {
      on: 'id, id'
    },
    group_tag: {
      on: ['id', 'group_id']
    },
    tag: {
      on: {
        id: 'id',
        title: '`tag`.`name`'
      }
    }
  }], {
    tablePrefix: '',
    table: 'user'
  });
  t.assert.strictEqual(data, ' LEFT JOIN `cate` ON `user`.`id` = `cate`.`id` LEFT JOIN `group_tag` ON `user`.`id` = `group_tag`.`group_id` LEFT JOIN `tag` ON (`user`.`id`=`tag`.`id` AND `user`.`title`=`tag`.`name`)');
});

test('parseJoin, array, multi 4', t => {
  const instance = getParserInstance();
  const data = instance.parseJoin([{
    cate: {
      on: 'id, id'
    },
    group_tag: {
      on: ['id', 'group_id']
    },
    tag: {
      on: {
        id: 'id',
        'u1.title': 'tag.name'
      }
    }
  }], {
    tablePrefix: '',
    table: 'user'
  });
  t.assert.strictEqual(data, ' LEFT JOIN `cate` ON `user`.`id` = `cate`.`id` LEFT JOIN `group_tag` ON `user`.`id` = `group_tag`.`group_id` LEFT JOIN `tag` ON (`user`.`id`=`tag`.`id` AND u1.title=tag.name)');
});

test('parseJoin, array, table is sql', t => {
  const instance = getParserInstance();
  const data = instance.parseJoin([{
    table: 'SELECT * FROM test WHERE 1=1',
    join: 'left',
    as: 'temp',
    on: ['id', 'temp.team_id']
  }], {
    tablePrefix: '',
    table: 'user'
  });
  t.assert.strictEqual(data, ' LEFT JOIN (SELECT * FROM test WHERE 1=1) AS `temp` ON `user`.`id` = temp.team_id');
});

test('parseJoin, array, table is sql 1', t => {
  const instance = getParserInstance();
  const data = instance.parseJoin([{
    table: 'SELECT * FROM test WHERE 1=1',
    join: 'left',
    as: 'temp',
    on: ['u.id', 'temp.team_id']
  }], {
    tablePrefix: '',
    table: 'user'
  });
  t.assert.strictEqual(data, ' LEFT JOIN (SELECT * FROM test WHERE 1=1) AS `temp` ON u.id = temp.team_id');
});

test('parseJoin, array, table is sql 2', t => {
  const instance = getParserInstance();
  const data = instance.parseJoin([{
    table: 'SELECT * FROM test WHERE 1=1',
    join: 'left',
    as: 'temp',
    on: ['id', 'team_id']
  }], {
    tablePrefix: '',
    table: 'user'
  });
  t.assert.strictEqual(data, ' LEFT JOIN (SELECT * FROM test WHERE 1=1) AS `temp` ON `user`.`id` = `temp`.`team_id`');
});

test('parseJoin, array, table is sql 3', t => {
  const instance = getParserInstance();
  const data = instance.parseJoin([{
    table: '(SELECT * FROM test WHERE 1=1)',
    join: 'left',
    as: 'temp',
    on: ['id', 'team_id']
  }], {
    tablePrefix: '',
    table: 'user'
  });
  t.assert.strictEqual(data, ' LEFT JOIN (SELECT * FROM test WHERE 1=1) AS `temp` ON `user`.`id` = `temp`.`team_id`');
});

test('parseThinkWhere, key is empty, ignore valud', t => {
  const instance = getParserInstance();
  const data = instance.parseThinkWhere('', 'SELECT * FROM user');
  t.assert.strictEqual(data, '');
});

test('parseThinkWhere, _string', t => {
  const instance = getParserInstance();
  const data = instance.parseThinkWhere('_string', 'SELECT * FROM user');
  t.assert.strictEqual(data, 'SELECT * FROM user');
});

test('parseThinkWhere, _query', t => {
  const instance = getParserInstance();
  const data = instance.parseThinkWhere('_query', 'name=lizheming&name1=suredy');
  t.assert.strictEqual(data, '`name` = \'lizheming\' AND `name1` = \'suredy\'');
});

test('parseThinkWhere, _query, with logic', t => {
  const instance = getParserInstance();
  const data = instance.parseThinkWhere('_query', 'name=lizheming&name1=suredy&_logic=OR');
  t.assert.strictEqual(data, '`name` = \'lizheming\' OR `name1` = \'suredy\'');
});

test('parseThinkWhere, _query, object', t => {
  const instance = getParserInstance();
  const data = instance.parseThinkWhere('_query', { name: 'lizheming', name1: 'suredy' });
  t.assert.strictEqual(data, '`name` = \'lizheming\' AND `name1` = \'suredy\'');
});

test('parseWhere, empty', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere();
  t.assert.strictEqual(data, '');
});

test('parseWhere, empty 1', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({ _logic: 'AND' });
  t.assert.strictEqual(data, '');
});

test('parseWhere, 1=1', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({ 1: 1 });
  t.assert.strictEqual(data, ' WHERE ( 1 = 1 )');
});

test('parseWhere, key is not valid', t => {
  const instance = getParserInstance();
  try {
    instance.parseWhere({ '&*&*&*': 'title' });
    t.assert.fail('parseWhere fail without error when key is not valid');
  } catch (e) {
    t.assert.ok(true);
  }
});

test('parseWhere, string & object', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({ title: 'lizheming', _string: 'status=1' });
  t.assert.strictEqual(data, ' WHERE ( `title` = \'lizheming\' ) AND ( status=1 )');
});

test('parseWhere, null', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({ title: null });
  t.assert.strictEqual(data, ' WHERE ( `title` IS NULL )');
});

test('parseWhere, null 1', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({ title: { '=': null } });
  t.assert.strictEqual(data, ' WHERE ( `title` IS NULL )');
});

test('parseWhere, null 2', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({ title: ['=', null] });
  t.assert.strictEqual(data, ' WHERE ( `title` IS NULL )');
});

test('parseWhere, not null', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({ title: { '!=': null } });
  t.assert.strictEqual(data, ' WHERE ( `title` IS NOT NULL )');
});

test('parseWhere, not null 1', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({ title: ['!=', null] });
  t.assert.strictEqual(data, ' WHERE ( `title` IS NOT NULL )');
});

test('parseWhere, object', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({ id: 10 });
  t.assert.strictEqual(data, ' WHERE ( `id` = 10 )');
});

test('parseWhere, object IN number', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({ id: { IN: [1, 2, 3] } });
  t.assert.strictEqual(data, ' WHERE ( `id` IN (1, 2, 3) )');
});

test('parseWhere, IN number string', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({ id: [1, 2, 3] });
  t.assert.strictEqual(data, ' WHERE ( `id` IN ( 1, 2, 3 ) )');
});

test('parseWhere, object 1', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({ id: [1, 10, 'string'] });
  t.assert.strictEqual(data, ' WHERE ( (`id` = 1) AND (`id` = 10) AND (`id` = \'string\') )');
});

test('parseWhere, IN number string #2', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({ id: ['1', '2', '3'] });
  t.assert.strictEqual(data, ' WHERE ( `id` IN ( 1, 2, 3 ) )');
});

test('parseWhere, object IN number string', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({ id: { IN: ['1', '2', '3'] } });
  t.assert.strictEqual(data, ' WHERE ( `id` IN (\'1\', \'2\', \'3\') )');
});

test('parseWhere, object 1 #2', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({ id: ['!=', 10] });
  t.assert.strictEqual(data, ' WHERE ( `id` != 10 )');
});

test('parseWhere, string', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere('id = 10 OR id < 2');
  t.assert.strictEqual(data, ' WHERE id = 10 OR id < 2');
});

test('parseWhere, EXP', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({ name: ['EXP', "='name'"] });
  t.assert.strictEqual(data, ' WHERE ( (`name` =\'name\') )');
});

test('parseWhere, EXP 1', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({ view_nums: ['EXP', '=view_nums+1'] });
  t.assert.strictEqual(data, ' WHERE ( (`view_nums` =view_nums+1) )');
});

test('parseWhere, LIKE', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({ title: ['NOTLIKE', 'lizheming'] });
  t.assert.strictEqual(data, ' WHERE ( `title` NOT LIKE \'lizheming\' )');
});

test('parseWhere, LIKE 1', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({ title: ['like', '%lizheming%'] });
  t.assert.strictEqual(data, ' WHERE ( `title` LIKE \'%lizheming%\' )');
});

test('parseWhere, LIKE 2', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({ title: ['like', ['lizheming', 'suredy']] });
  t.assert.strictEqual(data, ' WHERE ( (`title` LIKE \'lizheming\' OR `title` LIKE \'suredy\') )');
});

test('parseWhere, LIKE 3', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({ title: ['like', ['lizheming', 'suredy'], 'AND'] });
  t.assert.strictEqual(data, ' WHERE ( (`title` LIKE \'lizheming\' AND `title` LIKE \'suredy\') )');
});

test('parseWhere, key has |', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({ 'title|content': ['like', '%lizheming%'] });
  t.assert.strictEqual(data, ' WHERE ( (`title` LIKE \'%lizheming%\') OR (`content` LIKE \'%lizheming%\') )');
});

test('parseWhere, key has |, multi', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({
    'title|content': [
      ['like', '%title%'], ['=', '%content%']
    ],
    _multi: true
  });
  t.assert.strictEqual(data, ' WHERE ( (`title` LIKE \'%title%\') OR (`content` = \'%content%\') )');
});

test('parseWhere, key has |, multi #2', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({
    'title|content': [
      ['like', '%title%'], ['=', '%content%']
    ],
    _multi: true
  });
  t.assert.strictEqual(data, ' WHERE ( (`title` LIKE \'%title%\') OR (`content` = \'%content%\') )');
});

test('parseWhere, key has &', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({ 'title&content': ['like', '%lizheming%'] });
  t.assert.strictEqual(data, ' WHERE ( (`title` LIKE \'%lizheming%\') AND (`content` LIKE \'%lizheming%\') )');
});

test('parseWhere, key has &, multi', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({
    'title&content': [
      ['like', '%lizheming%'],
      ['!=', '%content%']
    ],
    _multi: true
  });
  t.assert.strictEqual(data, ' WHERE ( (`title` LIKE \'%lizheming%\') AND (`content` != \'%content%\') )');
});

test('parseWhere, IN', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({ id: ['IN', '10,20'] });
  t.assert.strictEqual(data, ' WHERE ( `id` IN (\'10\',\'20\') )');
});

test('parseWhere, IN 1', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({ id: ['IN', [10, 20]] });
  t.assert.strictEqual(data, ' WHERE ( `id` IN (10,20) )');
});

test('parseWhere, IN 2', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({ id: ['NOTIN', [10, 20]] });
  t.assert.strictEqual(data, ' WHERE ( `id` NOT IN (10,20) )');
});

test('parseWhere, NOT IN, only one', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({ id: ['NOTIN', 10] });
  t.assert.strictEqual(data, ' WHERE ( `id` != 10 )');
});

test('parseWhere, IN, only one', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({ id: ['IN', 10] });
  t.assert.strictEqual(data, ' WHERE ( `id` = 10 )');
});

test('parseWhere, IN, object', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({ id: { IN: [1, 2, 3] } });
  t.assert.strictEqual(data, ' WHERE ( `id` IN (1, 2, 3) )');
});

test('parseWhere, IN, has exp', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({ id: ['NOTIN', '(10,20,30)', 'exp'] });
  t.assert.strictEqual(data, ' WHERE ( `id` NOT IN (10,20,30) )');
});

test('parseWhere, multi fields', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({ id: 10, title: 'www' });
  t.assert.strictEqual(data, ' WHERE ( `id` = 10 ) AND ( `title` = \'www\' )');
});

test('parseWhere, multi fields 1', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({ id: 10, title: 'www', _logic: 'OR' });
  t.assert.strictEqual(data, ' WHERE ( `id` = 10 ) OR ( `title` = \'www\' )');
});

test('parseWhere, multi fields 2', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({ id: 10, title: 'www', _logic: 'XOR' });
  t.assert.strictEqual(data, ' WHERE ( `id` = 10 ) XOR ( `title` = \'www\' )');
});

test('parseWhere, BETWEEN', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({ id: ['BETWEEN', 1, 2] });
  t.assert.strictEqual(data, ' WHERE (  (`id` BETWEEN 1 AND 2) )');
});

test('parseWhere, BETWEEN #2', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({ id: ['BETWEEN', '2017-04-13 00:00:00', '2017-04-19 00:00:00'] });
  t.assert.strictEqual(data, ' WHERE (  (`id` BETWEEN \'2017-04-13 00:00:00\' AND \'2017-04-19 00:00:00\') )');
});

test('parseWhere, BETWEEN #3', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({ id: ['between', '1,2'] });
  t.assert.strictEqual(data, ' WHERE (  (`id` BETWEEN \'1\' AND \'2\') )');
});

test('parseWhere, error', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({
    id: ['not between', '1,2']
  });
  t.assert.strictEqual(data, ' WHERE (  (`id` NOT BETWEEN \'1\' AND \'2\') )');
});

test('parseWhere, complex', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({
    id: {
      '>': 10,
      '<': 20
    }
  });
  t.assert.strictEqual(data, ' WHERE ( `id` > 10 AND `id` < 20 )');
});

test('parseWhere, complex 1', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({
    id: {
      '>': 10,
      '<': 20,
      _logic: 'OR'
    }
  });
  t.assert.strictEqual(data, ' WHERE ( `id` > 10 OR `id` < 20 )');
});

test('parseWhere, complex 2', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({
    id: {
      '>=': 10,
      '<=': 20
    },
    'title': ['like', '%lizheming%'],
    date: ['>', '2014-08-12'],
    _logic: 'OR'
  });
  t.assert.strictEqual(data, ' WHERE ( `id` >= 10 AND `id` <= 20 ) OR ( `title` LIKE \'%lizheming%\' ) OR ( `date` > \'2014-08-12\' )');
});

test('parseWhere, complex 3', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({
    title: 'test',
    _complex: {
      id: ['IN', [1, 2, 3]],
      content: 'www',
      _logic: 'or'
    }
  });
  t.assert.strictEqual(data, ' WHERE ( `title` = \'test\' ) AND (  ( `id` IN (1,2,3) ) OR ( `content` = \'www\' ) )');
});

test('parseWhere, complex 4', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({
    _complex: [
      {
        id: ['IN', [1, 2, 3]],
        content: 'www',
        _logic: 'or'
      },
      {
        name: 'lizheming',
        email: 'lizheming@163.com',
        _logic: 'or',
        _complex: [
          {
            admin: true,
            status: 0,
            _logic: 'and'
          },
          {
            status: 1,
            ip: '127.0.0.1',
            _logic: 'or'
          }
        ]
      }
    ]
  });
  t.assert.strictEqual(data, ' WHERE (  ( `id` IN (1,2,3) ) OR ( `content` = \'www\' ) ) AND (  ( `name` = \'lizheming\' ) OR ( `email` = \'lizheming@163.com\' ) OR (  ( `admin` = 1 ) AND ( `status` = 0 ) ) OR (  ( `status` = 1 ) OR ( `ip` = \'127.0.0.1\' ) ) )');
});

test('parseWhere, complex 5', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({
    _logic: 'or',
    _complex: [
      {
        start_date: ['<=', '2017-01-01'],
        end_date: ['>=', '2017-01-01']
      },
      {
        start_date: ['<=', '2017-01-01'],
        end_date: ['>=', '2017-01-01']
      }
    ]
  });
  t.assert.strictEqual(data, ' WHERE (  ( `start_date` <= \'2017-01-01\' ) AND ( `end_date` >= \'2017-01-01\' ) ) OR (  ( `start_date` <= \'2017-01-01\' ) AND ( `end_date` >= \'2017-01-01\' ) )');
});

test('parseWhere, other', t => {
  const instance = getParserInstance();
  try {
    instance.parseWhere({
      title: ['OTHER', 'dd']
    });
    t.assert.fail('parseWhere fail without error when other data');
  } catch (e) {
    t.assert.ok(true);
  }
});

test('parseWhere, array', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({
    title: [
      ['exp', '= \'lizheming\'']
    ]
  });
  t.assert.strictEqual(data, ' WHERE ( (`title` = \'lizheming\') )');
});

test('parseWhere, array, multi', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({
    title: [
      ['exp', '= \'lizheming\''],
      ['=', 'suredy']
    ]
  });
  t.assert.strictEqual(data, ' WHERE ( (`title` = \'lizheming\') AND (`title` = \'suredy\') )');
});

test('parseWhere, array, multi， or', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({
    title: [
      ['exp', '= \'lizheming\''],
      ['=', 'suredy'],
      'OR'
    ]
  });
  t.assert.strictEqual(data, ' WHERE ( (`title` = \'lizheming\') OR (`title` = \'suredy\') )');
});

test('parseWhere, array, multi， or #2', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({
    title: [
      ['exp', '= \'lizheming\''],
      ['!=', 'suredy'],
      'OR'
    ]
  });
  t.assert.strictEqual(data, ' WHERE ( (`title` = \'lizheming\') OR (`title` != \'suredy\') )');
});

test('parseWhere, array, multi， or #3', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({
    title: [
      ['exp', '= \'lizheming\''],
      'suredy',
      'OR'
    ]
  });
  t.assert.strictEqual(data, ' WHERE ( (`title` = \'lizheming\') OR (`title` = \'suredy\') )');
});

test('buildSelectSql', t => {
  const instance = getParserInstance();
  const data = instance.buildSelectSql({
    table: 'user',
    where: {
      id: 11,
      title: 'lizheming'
    },
    group: 'name',
    field: 'name,title',
    order: 'name DESC',
    limit: '10, 20',
    distinct: true
  });
  t.assert.strictEqual(data, "SELECT DISTINCT `name`,`title` FROM `user` WHERE ( `id` = 11 ) AND ( `title` = 'lizheming' ) GROUP BY `name` ORDER BY name DESC LIMIT 10,20");
});

test('parseSql', t => {
  const instance = getParserInstance({ prefix: 'think_' });
  const data = instance.parseSql('SELECT * FROM __USER__ WHERE name=1');
  t.assert.strictEqual(data, 'SELECT * FROM `think_user` WHERE name=1');
});

test('parseSql 1', t => {
  const instance = getParserInstance({ prefix: 'think_' });
  const data = instance.parseSql('SELECT * FROM __USER__ WHERE name=\'%TEST%\'');
  t.assert.strictEqual(data, 'SELECT * FROM `think_user` WHERE name=\'%TEST%\'');
});

test('parseUnion, empty', t => {
  const instance = getParserInstance({ prefix: 'think_' });
  const data = instance.parseUnion();
  t.assert.strictEqual(data, '');
});

test('parseUnion, string', t => {
  const instance = getParserInstance({ prefix: 'think_' });
  const data = instance.parseUnion('SELECT * FROM meinv_pic2');
  t.assert.strictEqual(data, ' UNION (SELECT * FROM meinv_pic2)');
});

test('parseUnion, object', t => {
  const instance = getParserInstance({ prefix: 'think_' });
  const data = instance.parseUnion({ table: 'meinv_pic2' });
  t.assert.strictEqual(data, ' UNION (SELECT * FROM `meinv_pic2`)');
});

test('parseUnion, object #2', t => {
  const instance = new Parser({ prefix: 'think_' });
  const data = instance.parseUnion({ table: 'meinv_pic2' });
  t.assert.strictEqual(data, ' UNION (SELECT * FROM meinv_pic2)');
});

test('parseUnion, array', t => {
  const instance = getParserInstance({ prefix: 'think_' });
  const data = instance.parseUnion([{
    union: { table: 'meinv_pic2' },
    all: true
  }]);
  t.assert.strictEqual(data, ' UNION ALL (SELECT * FROM `meinv_pic2`)');
});

test('parseUnion, array #2', t => {
  const instance = getParserInstance({ prefix: 'think_' });
  const data = instance.parseUnion([{
    union: 'SELECT * FROM meinv_pic2'
  }]);
  t.assert.strictEqual(data, ' UNION (SELECT * FROM meinv_pic2)');
});

test('buildInsertSql', t => {
  const instance = getParserInstance();
  const sql = instance.buildInsertSql({
    table: 'user',
    values: '1,lizheming',
    fields: 'id,name',
    replace: true
  });
  t.assert.strictEqual(sql, 'REPLACE INTO `user` (id,name) VALUES (1,lizheming)');
});

test('buildInsertSql 2', t => {
  const instance = getParserInstance();
  const sql = instance.buildInsertSql({
    table: 'user',
    values: '1,lizheming',
    fields: 'id,name',
    ignore: true
  });
  t.assert.strictEqual(sql, 'INSERT IGNORE INTO `user` (id,name) VALUES (1,lizheming)');
});

test('buildInsertSql 3', t => {
  const instance = getParserInstance();
  const sql = instance.buildInsertSql({
    table: 'user',
    values: '1,lizheming',
    fields: 'id,name',
    replace: true,
    ignore: true
  });
  t.assert.strictEqual(sql, 'REPLACE INTO `user` (id,name) VALUES (1,lizheming)');
});
