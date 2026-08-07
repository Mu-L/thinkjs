const {test} = require('node:test');
const mock = require('mock-require');

function createLoader(modules = 'modules') {
  const Loader = mock.reRequire('../index.js');
  var loader = new Loader('apppath', 'thinkpath');
  loader.modules = modules;
  return loader;
}

test('loadConfig will pass the right params and return', t => {
  mock('../loader/config.js', class config {
    load(a, b, c) {
      t.assert.strictEqual(a, 'apppath');
      t.assert.strictEqual(b, 'env');
      t.assert.strictEqual(c, 'modules');
      return 'config';
    }
  });

  var loader = createLoader();
  t.assert.strictEqual(loader.loadConfig('env'), 'config');
});

test('loadBootstrap will pass the right params and return', t => {
  mock('../loader/bootstrap', function(a, b) {
    t.assert.strictEqual(a, 'apppath');
    t.assert.strictEqual(b, 'modules');
    return 'bootstrap';
  });
  var loader = createLoader();
  t.assert.strictEqual(loader.loadBootstrap(), 'bootstrap');
});

function testCommon(method, name, para) {
  return t => {
    mock('../loader/common.js', {
      load(a, b, c) {
        t.assert.strictEqual(a, 'apppath');
        t.assert.strictEqual(b, name);
        t.assert.strictEqual(c, 'modules');
        return name;
      }
    });
    var loader = createLoader();
    if (para) {
      t.assert.strictEqual(loader[method](para), name);
    } else {
      t.assert.strictEqual(loader[method](), name);
    }
  };
}
test('loadController will pass the right params and return', testCommon('loadController', 'controller'));

test('loadLogic will pass the right params and return', testCommon('loadLogic', 'logic'));

test('loadModel will pass the right params and return', testCommon('loadModel', 'model'));

test('loadService will pass the right params and return', testCommon('loadService', 'service'));

test('loadCommon will pass the right params and return', testCommon('loadCommon', 'some name', 'some name'));

test('loadMiddleware will pass the right params and return', t => {
  mock('../loader/middleware.js', class middleware {
    load(a, b, c) {
      t.assert.strictEqual(a, 'apppath');
      t.assert.strictEqual(b, 'modules');
      t.assert.strictEqual(c, 'app');
      return 'middleware';
    }
  });
  var loader = createLoader();
  t.assert.strictEqual(loader.loadMiddleware('app'), 'middleware');
});

test('loadRouter will pass the right params and return', t => {
  mock('../loader/router.js', {
    load: function(a, b) {
      t.assert.strictEqual(a, 'apppath');
      t.assert.strictEqual(b, 'modules');
      return 'router';
    }
  });
  var loader = createLoader();
  t.assert.strictEqual(loader.loadRouter(), 'router');
});
