const {test, before} = require('node:test');
const Logger = require('../src');
const process = require('process');
const Adapter = Logger.Console;

before(() => {
  global.server_log = '';
  process.stdout.write = (write => (string, ...args) => {
    global.server_log += string;
    write.apply(process.stdout, [string, ...args]);
  })(process.stdout.write);
});

test('console logger #2', t => {
  const funcNames = ['trace', 'debug', 'info', 'warn', 'error'];
  const logger = new Logger({handle: Adapter});

  t.plan(funcNames.length);
  for (const funcName of funcNames) {
    const func = logger[funcName];
    func('Hello World');
    t.assert.strictEqual(global.server_log.includes('Hello World'), true);
    global.server_log = '';
  }
});
