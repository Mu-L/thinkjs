/*
* @Author: lushijie
* @Date:   2017-03-14 19:25:56
* @Last Modified by:   lushijie
* @Last Modified time: 2017-09-13 11:49:47
*/
const {test} = require('node:test');
const helper = require('think-helper');
const path = require('path');
const fs = require('fs');
const thinkCache = require('../index.js');

let cacheDB = thinkCache.think.cache;

const thisConfig = {
  config(name) {
    return {
      type: 'file'
    }
  }
}

class Redis {
  constructor(config) {
    this.config = config;
  }
  get(arg) {
    if(arg === 'nothave') {
      return Promise.resolve(undefined);
    }
    return Promise.resolve('thinkjs');
  }
  set() {
    return Promise.resolve(true);
  }
  delete() {
    return Promise.resolve(1);
  }
}

function getConfig() {
  return {
    timeout: 6 * 3600,
    handle: Redis
  }
}

test('delete by cache name', async t => {
  let ret = await cacheDB.apply(thisConfig, ['name', null, getConfig()]);
  t.assert.strictEqual(1, ret);
});


test('get by cache name', async t => {
  let ret = await cacheDB.apply(thisConfig, ['name', undefined, getConfig()]);
  t.assert.strictEqual('thinkjs', ret);
});

test('set cache ', async t => {
  let ret = await cacheDB.apply(thisConfig, ['name', 'thinkjs', getConfig()]);
  t.assert.strictEqual(ret, true);
});

test('set cache 2', async t => {
  const this_Config = {
    config(name) {
      return {
        type: 'file',
        handle: Redis
      }
    }
  }
  let ret = await cacheDB.apply(this_Config, ['name', 'thinkjs']);
  t.assert.strictEqual(ret, true);
});


test('get cache when value is function and function return undefined', async t => {
  let argName = 'nothave';
  let ret = await cacheDB.apply(thisConfig, [
    argName,
    function(arg) {
      return arg;
    },
    getConfig()
  ]);
  t.assert.strictEqual(argName, ret);
});

test('get cache when value is function and function return value', async t => {
  let argName = 'have';
  let ret = await cacheDB.apply(thisConfig, [
    argName,
    function(arg) {
      return arg;
    },
    getConfig()
  ]);
  t.assert.strictEqual('thinkjs', ret);
});
