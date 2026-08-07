const fs = require('fs');
const {test, before} = require('node:test');
const Logger = require('../src');
const Adapter = Logger.File;

const sleep = time => new Promise(resolve => setTimeout(resolve, time));
const filename = `${__dirname}/test.log`;

before(() => {
  try {
    fs.statSync(filename);
    fs.unlinkSync(filename);
  } catch (e) {

  } finally {
    fs.writeFileSync(filename, '', {encoding: 'utf-8'});
  }
});

test('file logger #2', async t => {
  const logger = new Logger({
    handle: Adapter,
    filename
  });

  const funcs = ['trace', 'debug', 'info', 'warn', 'error'];
  funcs.forEach(func => logger[func]('Hello World'));

  await sleep(500);

  const text = fs.readFileSync(filename, {encoding: 'utf-8'});
  t.assert.strictEqual(text.split('Hello World').length === funcs.length + 1, true);

  fs.unlinkSync(filename);
});
