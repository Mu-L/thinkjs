const {test, afterEach} = require('node:test');
const mock = require('mock-require');
const cluster = require('cluster');
const http = require('http');
const path = require('path');
const sleep = time => new Promise(resolve => setTimeout(resolve, time));
const spawn = require('child_process').spawn;
const exec = require('child_process').exec;
const helper = require('think-helper');

const interval = 5000;

let masterProcess = null;
afterEach(() => {
  if (masterProcess) {
    masterProcess.kill();
  }
});

function executeProcess(fileName, options, funcName, callback) {
  const scriptPath = path.join(__dirname, '../script', fileName);
  masterProcess = spawn(`node`, [scriptPath, funcName, JSON.stringify(options)]);

  masterProcess.stdout.on('data', (buf) => {
    try {
      const json = JSON.parse(buf.toString('utf-8'));
      callback(json);
    } catch (e) {
      callback({message: buf.toString('utf-8')});
    }
  });

  return masterProcess;
}

test('normal case', async t => {
  try {
    const result = {};
    const options = {
      workers: 1
    };
    executeProcess('master.js', options, 'forkWorkers', (output) => {
      Object.assign(result, output);
    });
    await sleep(interval);
    t.assert.strictEqual(result.isForked, true);
    t.assert.strictEqual(result.options.workers, 1);
  } catch (e) {
  }
});

test('options.workers >= 2 && enableAgent is true', async t => {
  try {
    const result = {};
    const options = {
      workers: 2,
      reloadSignal: 'SIGUSR2',
      enableAgent: true
    };
    executeProcess('master.js', options, 'forkWorkers', (output) => {
      Object.assign(result, output);
    });
    await sleep(interval);
    t.assert.strictEqual(result.isForked, true);
    t.assert.strictEqual(result.options.enableAgent, true);
  } catch (e) {
  }
});

test('if options.workers < 2,enableAgent is false', async t => {
  try {
    const result = {};
    const options = {
      workers: 1,
      reloadSignal: 'SIGUSR2',
      enableAgent: true
    };
    executeProcess('master.js', options, 'forkWorkers', (output) => {
      Object.assign(result, output);
    });
    await sleep(interval);
    t.assert.strictEqual(result.isForked, true);
    // if workers < 2, set enableAgent false
    t.assert.strictEqual(result.options.enableAgent, false);
  } catch (e) {
  }
});

test('reloadWorkers', async t => {
  try {
    const result = {};
    executeProcess('master.js', {workers: 4}, 'reloadWorkers', (output) => {
      Object.assign(result, output);
    });
    await sleep(interval * 2);
    // console.log(result);
    t.assert.notDeepStrictEqual(result.beforeWorkers, result.afterWorkers);
  } catch (e) {
  }
});

test('trigger SIGUSR2 signal', async t => {
  try {
    const result = {};
    const options = {
      reloadSignal: 'SIGUSR2'
    };
    const masterProcess = executeProcess('master.js', options, 'forkWorkers', (output) => {
      Object.assign(result, output);
    });
    await sleep(interval);
    t.assert.strictEqual(result.isForked, true);
    console.log(`master process id is ${masterProcess.pid}`);
    await sleep(interval);

    exec(`KILL -SIGUSR2 ${masterProcess.pid}`, {shell: '/bin/sh'}, (error, stdout, stderr) => {
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
      if (error !== null) {
        console.log(`exec error: ${error}`);
      }
    });
    await sleep(interval);
  } catch (e) {
  }
});

test('trigger worker unHandleRejection ', async t => {
  try {
    const result = {};
    const options = {
      workers: 1
    };
    executeProcess('worker.js', options, 'unHandleRejection', (output) => {
      Object.assign(result, output);
      console.log(result);
    });
    await sleep(interval);
    t.assert.strictEqual(result.message.indexOf('onUnhandledRejection') != -1, true);
  } catch (e) {
  }
});

test('trigger worker unCaughtException', async t => {
  try {
    const result = {};
    const options = {
      workers: 1
    };
    executeProcess('worker.js', options, 'unCaughtException', (output) => {
      Object.assign(result, output);
      console.log(result);
    });
    await sleep(interval);
    t.assert.strictEqual(result.message.indexOf('onUncaughtException') != -1, true);
  } catch (e) {
  }
});
