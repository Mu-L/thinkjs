const {test} = require('node:test');
const routerREST = require('../index.js');

test('rest true', t => {
  const ctx = {
    path: '/api/user',
    controller: 'api/user',
    action: 'index',
    method: 'POST',
    app: {
      modules: [],
      controllers: {
        'api/user': {
          _REST: true
        }
      }
    }
  };

  routerREST({})(ctx, () => true);
  t.assert.strictEqual(ctx.action, 'post');
});

test('rest false', t => {
  const ctx = {
    path: '/api/user',
    controller: 'api/user',
    action: 'index',
    method: 'POST',
    app: {
      modules: [],
      controllers: {
        'api/user': {
        }
      }
    }
  };

  routerREST({})(ctx, () => true);
  t.assert.strictEqual(ctx.action, 'index');
});

test('rest custom method without post request', t => {
  const ctx = {
    path: '/api/user',
    controller: 'api/user',
    action: 'index',
    method: 'GET',
    query: {
      _method: 'DeLeTe'
    },
    app: {
      modules: [],
      controllers: {
        'api/user': {
          _REST: true,
          _method: '_method'
        }
      }
    }
  };

  routerREST({})(ctx, () => true);
  t.assert.strictEqual(ctx.action, 'get');
});

test('rest custom method with post request', t => {
  const ctx = {
    path: '/api/user',
    controller: 'api/user',
    action: 'index',
    method: 'POST',
    query: {
      _method: 'DeLeTe'
    },
    app: {
      modules: [],
      controllers: {
        'api/user': {
          _REST: true,
          _method: '_method'
        }
      }
    }
  };

  routerREST({})(ctx, () => true);
  t.assert.strictEqual(ctx.action, 'delete');
});
