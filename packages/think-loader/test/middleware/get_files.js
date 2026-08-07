const {test} = require('node:test');
const path = require('path');
function mockHelper(t, dir) {
  var helper = require('think-helper');
  helper.getdirFiles = function(d) {
    t.assert.strictEqual(d, dir);
    return ['a.js', 'b.js', 'c.es', 'd.config', 'e.js.etc'];
  };
}

function createInstance() {
  var Middleware = require('../../loader/middleware');
  return new Middleware();
}

function mockModule(dir) {
  const mock = require('mock-require');
  const ajs = path.join(dir, 'a.js');
  const bjs = path.join(dir, 'b.js');
  const ces = path.join(dir, 'c.es');
  mock(ajs, 1);
  mock(bjs, 2);
  mock(ces, 3);
}

test('getFiles', t => {
  mockHelper(t, 'middlewarePath');
  mockModule('middlewarePath');

  const middleware = createInstance();
  const result = middleware.getFiles('middlewarePath');
  t.assert.deepStrictEqual(result, {
    a: 1,
    b: 2,
    c: 3
  });
});
