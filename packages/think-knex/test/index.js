const {test} = require('node:test');
const plugin = require('..');

function createApp(config) {
  return {
    think: {
      config(name, defaultValue, moduleName) {
        return config(name, defaultValue, moduleName);
      }
    }
  };
}

test('exposes knex extension on think, service, controller and context', t => {
  const app = createApp(() => ({type: 'mysql', mysql: {client: 'mysql'}}));
  const extensions = plugin(app);

  t.assert.strictEqual(extensions.think.knex, extensions.service.knex);
  t.assert.strictEqual(extensions.think.knex, extensions.controller.knex);
  t.assert.strictEqual(extensions.think.knex, extensions.context.knex);
});

test('creates a knex instance from think config', t => {
  t.plan(3);
  const app = createApp((name, defaultValue, moduleName) => {
    t.assert.strictEqual(name, 'knex');
    t.assert.strictEqual(moduleName, 'common');
    return {type: 'mysql', mysql: {client: 'mysql'}};
  });

  const knex = plugin(app).think.knex();
  t.assert.strictEqual(knex.client.config.client, 'mysql');
  knex.destroy();
});

test('uses custom module config when module name is passed', t => {
  t.plan(2);
  const app = createApp((name, defaultValue, moduleName) => {
    t.assert.strictEqual(moduleName, 'admin');
    return {type: 'mysql', mysql: {client: 'mysql'}};
  });

  const knex = plugin(app).think.knex(undefined, 'admin');
  t.assert.strictEqual(knex.client.config.client, 'mysql');
  knex.destroy();
});
