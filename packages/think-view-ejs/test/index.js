const {default: test} = require('ava');
const ejs = require('ejs');


test.beforeEach(t => {
  ejs.___renderFile = ejs.renderFile;
});


function callEjsView(file, viewData, config) {
  delete require.cache[require.resolve('../index')];
  const thinkViewEjs = require('../index');
  const instance = new thinkViewEjs(file, viewData, config);
  return Promise.resolve(instance.render());
}
test('ejs render with beforeRender', async t => {
  const filename = '/file/path/../x.ejs';
  const tpl = '<%= name %>';
  const result = 'huangxiaolu';
  const viewData = {
    name: 'huangxiaolu'
  };
  const config = {
    beforeRender: function(ejs, conf) {
      
    }
  };
  function mockRenderFile() {
    ejs.renderFile = function(filename, data, config, cb) {
      const err = null;
      const str = result;
      cb(err, str);
    }
  }
  
  mockRenderFile();
  const rendered = await callEjsView(filename, viewData, config);
  t.is(rendered, result);
});
test('ejs render without beforeRender', async t => {
  const filename = '/file/path/../x.ejs';
  const tpl = '<%= name %>';
  const result = 'huangxiaolu';
  const viewData = {
    name: 'huangxiaolu'
  };
  const config = {};
  function mockRenderFile() {
    ejs.renderFile = function(filename, data, config, cb) {
      const err = null;
      const str = result;
      cb(err, str);
    }
  }
  
  mockRenderFile();
  const rendered = await callEjsView(filename, viewData, config);
  t.is(rendered, result);
});
test('ejs render error', async t => {
  const filename = '/file/path/../x.ejs';
  const tpl = '<%= name %>';
  const result = 'huangxiaolu';
  const viewData = {
    name: 'huangxiaolu'
  };
  const errmsg = "file not exist";
  const config = {};
  function mockRenderFile() {
    ejs.renderFile = function(filename, data, config, cb) {
      const err = new Error(errmsg);
      const str = result;
      cb(err, str);
    }
  }
  
  mockRenderFile();
  await t.throwsAsync(callEjsView(filename, viewData, config), {message: errmsg});
});
test.afterEach.always(t => {
  ejs.renderFile = ejs.___renderFile;
});
