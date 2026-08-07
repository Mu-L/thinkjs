const {test} = require('node:test');
const fs = require('fs');
const helper = require('think-helper');
const config = require('../../../lib/config/config');
const mockie = require('../../lib/mockie');
mockie.mockCookies();
let context = require('../../../lib/extend/context');

const mockContext = {
  data: {},
  header: {
    'user-agent': 'Mozilla/5.0',
    referer: 'https://github.com/thinkjs/thinkjs',
    'x-requested-with': 'XMLHttpRequest',
  },
  method: 'GET',
  request: {
    body: {
      post: {name: 'thinkjs', version: 3},
      file: {name: 'img'}
    }
  },
  // param(name){
  //   if (name === '_callback') {
  //     return 'test'
  //   }
  // },
  set(key, value){
    this.data[key] = value;
  },
  req:{},
  res:{},
  response:{
    get(){}
  },
  app: {
    emit() {}
  },
  attachment(){

  }
};

const mockThink = {
  configuration: {
    jsonpCallbackField: '_callback',
    errnoField: 'errno',
    errmsgField: 'errmsg',
    defaultErrno: 10010,
    jsonContentType: 'application/json;charset=utf-8'
  },
  isCli: true,
  isNumber(param){
    const numberReg = /^((\-?\d*\.?\d*(?:e[+-]?\d*(?:\d?\.?|\.?\d?)\d*)?)|(0[0-7]+)|(0x[0-9a-f]+))$/i;
    return numberReg.test(param)
  },
  isArray(param){
    return Array.isArray(param)
  },
  app: {
    emit() {},
    validators: {
      messages: {
        TEST_RULE: [1000, 'test'],
        TEST_NON_ARRAY_RULE: 'test'
      }
    }
  },
  config(name){
    return this.configuration[name]
  },
  controller(){},
  service(){},
  logger:{
    error:(err)=>{return err}
  }
};

Object.assign(context, mockContext);

global.think = Object.assign({}, mockThink);

test('get userAgent', async t => {
  t.assert.strictEqual(context.userAgent, mockContext.header['user-agent'])
});

test('referer', async t => {
  t.assert.strictEqual(context.referer(), mockContext.header['referer']);
  t.assert.strictEqual(context.referer(true), 'github.com');
});

test('isGet', async t => {
  t.assert.strictEqual(context.isGet, true)
});

test('isPost', async t => {
  t.assert.strictEqual(context.isPost, false)
});

test('isMethod', async t => {
  t.assert.strictEqual(context.isMethod('GET'), true);
  t.assert.strictEqual(context.isMethod('POST'), false);
});

test('isMethod #2', async t => {
  t.assert.strictEqual(context.isMethod('GET'), true);
  t.assert.strictEqual(context.isMethod('POST'), false);
});

test('get isCli', async t => {
  t.assert.strictEqual(context.isCli, false);
});

test('isAjax', async t => {
  t.assert.strictEqual(context.isAjax('GET'),true)
  t.assert.strictEqual(context.isAjax('POST'),false)
});

test('isJsonp', async t => {
  context.param('_callback','test')
  t.assert.strictEqual(context.isJsonp(),true)
  t.assert.strictEqual(context.isJsonp('_callback'),true)
});

test('jsonp', async t => {
  context.param('_callback','test')
  context.jsonp({name:'thinkjs'})
  t.assert.strictEqual(context.body,'test({"name":"thinkjs"})');
});

test('jsonp #2', async t => {
  context.param('_callback','test')
  context.jsonp({name:'thinkjs'})
  t.assert.strictEqual(context.body,'test({"name":"thinkjs"})');
});

test('jsonp empty fields', async t => {
  context.jsonp('test','empty');
  t.assert.strictEqual(context.body,'test');
});

test('json', async t => {
  context.json(JSON.stringify({name:'thinkjs'}));
  t.assert.strictEqual(context.body,JSON.stringify({name:'thinkjs'}));
});

test('success', async t => {
  context.success([],'success');
  t.assert.deepStrictEqual(context.body,{errno:0,errmsg:'success',data:[]});
});

test('success #2', async t => {
  let errObj = {errno:404,errmsg:'fail',data:[]};
  context.fail(errObj);
  t.assert.deepStrictEqual(context.body,errObj);

  context.fail(404,'fail',[]);
  t.assert.deepStrictEqual(context.body,{errno:404,errmsg:'fail',data:[]});

  context.fail('fail',[]);
  t.assert.deepStrictEqual(context.body,{errno:10010,errmsg:'fail',data:[]});

  context.fail('fail');
  t.assert.deepStrictEqual(context.body,{errno:10010,errmsg:'fail'});

  context.fail('TEST_RULE')
  t.assert.deepStrictEqual(context.body,{errno:1000,errmsg:'test'});

  context.fail('TEST_NON_ARRAY_RULE')
  t.assert.deepStrictEqual(context.body,{ errno: 10010, errmsg: 'TEST_NON_ARRAY_RULE' });

});

test('expires', async t => {
  context.expires('1d');
  t.assert.deepStrictEqual(context.data['Cache-Control'],'max-age=86400000');
});

test('config', async t => {
  t.assert.strictEqual(context.config('defaultErrno'),10010);
});

test('post', async t => {
  let result = context.post('name');
  result = context.post('name');
  t.assert.strictEqual(result, 'thinkjs');
  result = context.post();
  t.assert.deepStrictEqual(result, mockContext.request.body.post)
  let add = {age: 3};
  context.post(add)
  result = context.post();
  t.assert.deepStrictEqual(result, Object.assign({},add,mockContext.request.body.post));
  result = context.post('name,age');
  t.assert.deepStrictEqual(result, {name:'thinkjs',age:3});
  context.post('age',4);
  result = context.post('age');
  t.assert.deepStrictEqual(result, 4);
});

test('param', async t => {
  context.param('name','thinkjs');
  t.assert.strictEqual(context.param('name'),'thinkjs');
  t.assert.strictEqual(context.param().name,'thinkjs');
  context.param({age:3});
  t.assert.strictEqual(context.param().age,3);
  t.assert.strictEqual(context.param('name,age').name,'thinkjs')
  t.assert.strictEqual(context.param('name,age').age,3)
});

test('param array', async t => {
  context.param('name','thinkjs');
  t.assert.strictEqual(context.param('name'),'thinkjs');
  t.assert.strictEqual(context.param().name,'thinkjs');
  context.param({age:3});
  t.assert.strictEqual(context.param().age,3);
  t.assert.strictEqual(context.param(['name','age']).name,'thinkjs');
  t.assert.strictEqual(context.param(['name','age']).age,3)
  t.assert.strictEqual(Object.keys(context.param(['name','age', 'test'])).length,2)
});

test('post array', async t => {
  context.post('name','thinkjs');
  t.assert.strictEqual(context.post('name'),'thinkjs');
  t.assert.strictEqual(context.post().name,'thinkjs');
  context.post({age:3});
  t.assert.strictEqual(context.post().age,3);
  t.assert.strictEqual(context.post(['name','age']).name,'thinkjs');
  t.assert.strictEqual(context.post(['name','age']).age,3)
  t.assert.strictEqual(Object.keys(context.post(['name','age', 'test'])).length,2)
});



test('file', async t => {
  let result = context.file('name');
  t.assert.strictEqual(result,mockContext.request.body.file.name);
  result = context.file();
  t.assert.deepStrictEqual(result,mockContext.request.body.file);
  let file = {filename:'a.jpg'};
  context.file(file);
  result = context.file();
  t.assert.deepStrictEqual(result,Object.assign({},file,mockContext.request.body.file))
  context.file('Content-Type','image/png');
  t.assert.strictEqual(context.file('Content-Type'),'image/png')
});

test('cookie', async t => {
  context.cookie('username', 'think');
  t.assert.strictEqual(context.cookie('username'), 'think');
  context.cookie('username', null);
  t.assert.strictEqual(context.cookie('username'), '');
  let overLength = null;
  context.app = {
    emit() {
      overLength = true;
    }
  };
  let str = new Array(5000).join('|');
  context.cookie('username', str);
  t.assert.strictEqual(overLength,true);
});

test('controller / service', async t => {
  context.service();
});

test('config.onUnhandledRejection/onUncaughtException', async t => {
  t.assert.strictEqual('onUnhandledRejection',config.onUnhandledRejection('onUnhandledRejection'));
  t.assert.strictEqual('onUncaughtException',config.onUncaughtException('onUncaughtException'));
});

test('download', async t => {
  context.download(__dirname + '/controller.js');
  t.assert.strictEqual(context.body instanceof fs.ReadStream,true)
});

test('download with content-type and disposition', async t => {
  context.response.get = (key)=>{
    if(key === 'Content-Type'){
      return 'application/json'
    }else if(key === 'Content-Disposition'){
      return 'attachment:xxx'
    }
  }
  context.download(__dirname + '/controller.js');
  t.assert.strictEqual(context.body instanceof fs.ReadStream,true)
});
