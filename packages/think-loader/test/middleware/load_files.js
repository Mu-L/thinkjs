const {test} = require('node:test');
const path = require('path');
var callGetMidFilesParams;
function mockGetFiles(instance) {
  callGetMidFilesParams = [];
  instance.getFiles = function(a) {
    callGetMidFilesParams.push(a);
    return { [callGetMidFilesParams.length]: 'value' };
  };
  return callGetMidFilesParams;
}

function getInstance() {
  const Middleware = require('../../loader/middleware');
  return new Middleware();
}

test('loadFiles isMultiModule === true', t => {
  const middleware = getInstance();
  const params = mockGetFiles(middleware);
  const result = middleware.loadFiles('appPath', true);
  t.assert.deepStrictEqual(params, [
    path.join('appPath', 'common/middleware')
  ]);

  t.assert.deepStrictEqual(result, {
    1: 'value',
    controller: require('thinkjs/lib/middleware/controller'),
    logic: require('thinkjs/lib/middleware/logic'),
    meta: require('thinkjs/lib/middleware/meta'),
    payload: require('thinkjs/lib/middleware/payload'),
    resource: require('thinkjs/lib/middleware/resource'),
    router: require('thinkjs/lib/middleware/router'),
    trace: require('thinkjs/lib/middleware/trace')
  });
});

test('loadFiles isMultiModule === false', t => {
  const middleware = getInstance();
  const params = mockGetFiles(middleware);
  const result = middleware.loadFiles('appPath', false);
  t.assert.deepStrictEqual(params, [
    path.join('appPath', 'middleware')
  ]);

  t.assert.deepStrictEqual(result, {
    1: 'value',
    controller: require('thinkjs/lib/middleware/controller'),
    logic: require('thinkjs/lib/middleware/logic'),
    meta: require('thinkjs/lib/middleware/meta'),
    payload: require('thinkjs/lib/middleware/payload'),
    resource: require('thinkjs/lib/middleware/resource'),
    router: require('thinkjs/lib/middleware/router'),
    trace: require('thinkjs/lib/middleware/trace')
  });
});
