/*
* @Author: lushijie
* @Date:   2017-05-05 15:29:11
* @Last Modified by:   lushijie
* @Last Modified time: 2017-05-07 13:52:49
*/
const {default: test} = require('ava');
const helper = require('think-helper');
const gc = require('..');
let relay = 20; // setInterval is not precise
let RESULT = [];

function caclCount(array, key) {
  let num = 0;
  array.forEach((value) => {
    if(value == key) num++;
  });
  return num;
}

let instance = (gcType) => {
  return ({
    gcType: gcType,
    gc: () => {
      RESULT.push(gcType);
    }
  })
};

test.serial.afterEach(t => {
  RESULT = [];
});

test.serial('interval is function', async t => {
  gc(instance('think-cache-file'), function() {return false}, 1000);
  gc(instance('think-session-file'), function() {return true}, 1000);
  await new Promise(resolve => setTimeout(resolve, 2 * 1000 + relay));
  t.is(caclCount(RESULT, 'think-session-file'), 2);
});

test.serial('interval is default', async t => {
  gc(instance('think-cache-file2'), 2 * 1000, 1000);
  gc(instance('think-cache-file2'));
  await new Promise(resolve => setTimeout(resolve, 4 * 1000 + relay));
  let res1= caclCount(RESULT, 'think-cache-file2') == 2;
  let res2 = caclCount(RESULT, 'think-session-file') == 4;
  t.true(res1 && res2);
});
