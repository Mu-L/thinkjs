/*
* @Author: lushijie
* @Date:   2017-03-16 09:23:29
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-21 11:30:32
*/
const {default: test} = require('ava');
const helper = require('think-helper');
const path = require('path');
const fs = require('fs');
const FileStore = require('../index');

// del data dir after every test case
test.afterEach(() => {
  let cachePath = path.join(__dirname, 'data');
  return helper.rmdir(cachePath, false);
});

test.serial('set file & get file & del file', async t => {
  let content = 'Welcome to Thinkjs\'s World';
  let relativePath = 'abc/a.js';
  let storeInst = new FileStore(path.join(__dirname, 'data'));
  await storeInst.set(relativePath, content);
  let ret1 = await storeInst.get(relativePath);
  await storeInst.delete(relativePath);
  await storeInst.delete(relativePath);
  let ret2 = await storeInst.get(relativePath);

  t.true(ret1 === content && !ret2)
});

test.serial('set file & get file empty', async t => {
  let content = '';
  let relativePath = 'abc/a.js';
  let storeInst = new FileStore(path.join(__dirname, 'data'));
  await storeInst.set(relativePath, content);
  let ret1 = await storeInst.get(relativePath);
  t.true(ret1 === '')
});


test.serial('use exist dir', async t => {
  let content = 'Welcome to Thinkjs\'s World';
  let relativePath = 'abc/a.js';
  let storeInst = new FileStore(path.join(__dirname));
  await storeInst.set(relativePath, content);
  let ret1 = await storeInst.get(relativePath);

  helper.rmdir(path.join(__dirname, 'abc'), false).then(() => {
    t.true(ret1 === content)
  });
});
