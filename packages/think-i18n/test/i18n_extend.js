const {test, afterEach} = require('node:test');
const path = require('path');
const mock = require('mock-require');
const helper = require('think-helper');
function getInstance() {
  const i18n = mock.reRequire('../src/i18n');
  return new i18n();
}

function mockLocaleConfigs(instance, config={}) {
  instance.loadLocaleConfigs = function() {
    return config;
  }
}

afterEach(t => {
  mock.stopAll();
});

test('extend will call loadLocaleConfigs with options', t=>{
  var expectOptions;
  var options = {};
  var instance = getInstance();

  instance.loadLocaleConfigs = function(opt) {expectOptions = opt};

  var extend = instance.extend(options);
  var controller = extend.controller;

  t.assert.strictEqual(expectOptions, options);
  t.assert.strictEqual(helper.isObject(controller), true);
  t.assert.strictEqual(helper.isFunction(controller.getLocale), true);
  t.assert.strictEqual(helper.isFunction(controller.getI18n), true);
});


test('will listen to viewInit event when passed in app', t=>{
  var expectOptions;
  var actualFiled, actualInstance, actualEventKey;

  var mockView = {assign(field, result){
    actualFiled = field;
    actualInstance = result;
  }}
  var mockController = {getI18n(){
    return 'i18nInstance';
  }};
  var options = {app: {on: function(eventKey, action){
    actualEventKey = eventKey;
    action(mockView, mockController);
  }}};

  var instance = getInstance();

  instance.loadLocaleConfigs = function(){};

  var extend = instance.extend(options);

  t.assert.strictEqual(actualFiled, '__');
  t.assert.strictEqual(actualEventKey, 'viewInit');
  t.assert.strictEqual(actualInstance, 'i18nInstance');
});


test('when getLocale is empty read from accept-language', t=>{
  var instance = getInstance();
  mockLocaleConfigs(instance);
  var extend = instance.extend({});
  var mockController = {
    ctx: {request: {header: {'accept-language': 'a,b,c,d'}}}
  };
  var locales = extend.controller.getLocale.bind(mockController)();
  t.assert.deepStrictEqual(locales, ['a','b','c','d']);
});

test('when getLocale is empty read from accept-language 2', t=>{
  var instance = getInstance();
  mockLocaleConfigs(instance);
  var extend = instance.extend({});
  var mockController = {ctx: {request: {header: {}}}};
  var locales = extend.controller.getLocale.bind(mockController)();
  t.assert.deepStrictEqual(locales, []);
});

test('when getLocale is function', t=>{
  var instance = getInstance();
  var expectCtx;
  mockLocaleConfigs(instance);
  var extend = instance.extend({getLocale(ctx){expectCtx = ctx; return ['localeId'];}});
  var mockController = {ctx: {request: {header: {}}}};
  var locales = extend.controller.getLocale.bind(mockController)();
  t.assert.deepStrictEqual(expectCtx, {request: {header: {}}});
  t.assert.deepStrictEqual(locales, ['localeId']);
});

test('when getLocale by cookie', t=>{
  var instance = getInstance();
  var expectCtx;
  mockLocaleConfigs(instance);
  var extend = instance.extend({getLocale: {by: 'cookie', name: 'locale'}});
  var mockController = {ctx: {request: {header: {}}}};
  var locales = extend.controller.getLocale.bind(mockController)();
  t.assert.deepStrictEqual(locales, []);
});

test('when getLocale by cookie 2', t=>{
  var instance = getInstance();
  var expectCtx;
  mockLocaleConfigs(instance);
  var extend = instance.extend({getLocale: {by: 'cookie', name: 'locale'}});
  var mockController = {ctx: {request: {header: {cookie: 'sasd=aaa;locale=en-ch'}}}};
  var locales = extend.controller.getLocale.bind(mockController)();
  t.assert.deepStrictEqual(locales, ['en-ch']);
});


test('when getLocale by query', t=>{
  var instance = getInstance();
  var expectCtx;
  mockLocaleConfigs(instance);
  var extend = instance.extend({getLocale: {by: 'query', name: 'locale'}});
  var mockController = {ctx: {request: {url: 'asdfjsjfa'}}};
  var locales = extend.controller.getLocale.bind(mockController)();
  t.assert.deepStrictEqual(locales, []);
});

test('when getLocale by query 2', t=>{
  var instance = getInstance();
  var expectCtx;
  mockLocaleConfigs(instance);
  var extend = instance.extend({getLocale: {by: 'query', name: 'locale'}});
  var mockController = {ctx: {request: {url: 'asdfjsjfa?locale=en'}}};
  var locales = extend.controller.getLocale.bind(mockController)();
  t.assert.deepStrictEqual(locales, ['en']);
});

test('when getLocale by query 3', t=>{
  var instance = getInstance();
  var expectCtx;
  mockLocaleConfigs(instance);
  var extend = instance.extend({getLocale: {by: 'query', name: 'locale'}});
  var mockController = {ctx: {request: {url: 'asdfjsjfa?asjfksj=223&locale=en'}}};
  var locales = extend.controller.getLocale.bind(mockController)();
  t.assert.deepStrictEqual(locales, ['en']);
});

test('when getLocale by query 4', t=>{
  var instance = getInstance();
  var expectCtx;
  mockLocaleConfigs(instance);
  var extend = instance.extend({getLocale: {by: 'query', name: 'locale'}});
  var mockController = {ctx: {request: {url: 'asdfjsjfa%3Fasjfksj%3D223%26locale%3Den%26aaa%3D222%23somehash'}}};
  var locales = extend.controller.getLocale.bind(mockController)();
  t.assert.deepStrictEqual(locales, ['en']);
});

test('when getLocale by unknown 5', t=>{
  var instance = getInstance();
  var expectCtx;
  mockLocaleConfigs(instance);
  var extend = instance.extend({getLocale: {by: 'sfsdfsd', name: 'locale'}});
  var mockController = {};

  let err;
  t.assert.throws(()=>{
    extend.controller.getLocale.bind(mockController)();
  }, caughtError => {
    err = caughtError;
    return caughtError instanceof Error;
  });
  t.assert.strictEqual(err.message, 'getLocale.by must be value of "header", "query" or  "cookie".');
});


test('i18n will use param if provide', t=>{
  var instance = getInstance();
  mockLocaleConfigs(instance);
  var extend = instance.extend({});
  let err;
  t.assert.throws(()=>{
    extend.controller.getI18n({});
  }, caughtError => {
    err = caughtError;
    return caughtError instanceof Error;
  });
  t.assert.strictEqual(err.message, 'controller.getI18n(locale), locale must be string or undefined');
});

test('i18n will use debugLocale if provide and param not provided', t=>{
  var instance = getInstance();
  mockLocaleConfigs(instance);
  var extend = instance.extend({debugLocale: {}});
  let err;
  t.assert.throws(()=>{
    extend.controller.getI18n();
  }, caughtError => {
    err = caughtError;
    return caughtError instanceof Error;
  });
  t.assert.strictEqual(err.message, 'controller.getI18n(locale), locale must be string or undefined');
});


test('i18n will use getLocale if not provide param and debugLocale', t=>{
  var instance = getInstance();
  mockLocaleConfigs(instance);
  var callTimes = 0;
  var expectParam;
  var extend = instance.extend({localesMapping: function(a){expectParam = a; return {};}});
  var controller = extend.controller;
  controller.getLocale = function(){callTimes++; return 'getLocale';}
  let err;
  t.assert.throws(()=>{
    controller.getI18n();
  }, caughtError => {
    err = caughtError;
    return caughtError instanceof Error;
  });
  t.assert.strictEqual(callTimes, 1);
  t.assert.strictEqual(expectParam, 'getLocale');
  t.assert.strictEqual(err.message, 'controller.getI18n(locale), locale must be string or undefined');
});

test('i18n will throw if no matched localeConfig is found', t=>{
  var instance = getInstance();
  mockLocaleConfigs(instance);
  var extend = instance.extend({});
  var controller = extend.controller;
  let err;
  t.assert.throws(()=>{
    controller.getI18n('someLocale');
  }, caughtError => {
    err = caughtError;
    return caughtError instanceof Error;
  });
  t.assert.strictEqual(err.message, 'locale config someLocale not found');
});

test('i18n will return i18n object no match locales for moment and numeral', t=>{
  var moment = {locale(a){this.locale = a;}};
  var numeral = {locale(a){this.locale = a;}};
  var jedParam;
  var jed = function(param) {jedParam = param; this.gettext=function(key){return key}};
  mock('moment', moment);
  mock('numeral', numeral);
  mock('jed', jed);
  var instance = getInstance();
  mockLocaleConfigs(instance, {someLocale: {translation: {}}});
  var extend = instance.extend({jedOptions: {value: 'value'}});
  var controller = extend.controller;
  var evtListened = false;
  var mockController = {
    assign(){
      evtListened = true;
    }
  };

  const __ = controller.getI18n.bind(mockController)('someLocale');

  t.assert.strictEqual(moment.locale, 'en');
  t.assert.strictEqual(numeral.locale, 'en');
  t.assert.deepStrictEqual(jedParam, {value: 'value', locale_data: {}});

  t.assert.strictEqual(__('some key'), 'some key');
  t.assert.strictEqual(__.moment, moment);
  t.assert.strictEqual(__.numeral, numeral);
});

test('i18n will return i18n object not match locales for moment and numeral no jedOptions', t=>{
  var moment = {locale(a){this.locale = a;}};
  var numeral = {locale(a){this.locale = a;}};
  var jedParam;
  var jed = function(param) {jedParam = param; this.gettext=function(key){return key}};
  mock('moment', moment);
  mock('numeral', numeral);
  mock('jed', jed);
  var instance = getInstance();
  mockLocaleConfigs(instance, {someLocale: {translation: {}}});
  var extend = instance.extend({});
  var controller = extend.controller;
  var mockController = {
    assign(){},
  };
  const __ = controller.getI18n.bind(mockController)('someLocale');

  t.assert.strictEqual(moment.locale, 'en');
  t.assert.strictEqual(numeral.locale, 'en');
  t.assert.deepStrictEqual(jedParam, {locale_data: {}});

  t.assert.strictEqual(__('some key'), 'some key');

  t.assert.strictEqual(__.moment, moment);
  t.assert.strictEqual(__.numeral, numeral);
});


test('i18n will return i18n object and change locale accordingly', t=>{
  var moment = {locale(a){this.locale = a;}};
  var numeral = {locale(a){this.locale = a;}};
  var jedParam;
  var jed = function(param) {jedParam = param; this.gettext=function(key){return key}};
  mock('moment', moment);
  mock('numeral', numeral);
  mock('jed', jed);
  var instance = getInstance();
  mockLocaleConfigs(instance, {someLocale: {dateFormat: {}, numeralFormat: {}, translation: {}}});
  var extend = instance.extend({});
  var controller = extend.controller;
  var mockController = {
    assign(){}
  };
  const __ = controller.getI18n.bind(mockController)('someLocale');

  t.assert.strictEqual(moment.locale, 'someLocale');
  t.assert.strictEqual(numeral.locale, 'someLocale');
  t.assert.deepStrictEqual(jedParam, {locale_data: {}});

  t.assert.strictEqual(__('some key'), 'some key');
  t.assert.strictEqual(__.moment, moment);
  t.assert.strictEqual(__.numeral, numeral);
});
