const {test} = require('node:test');
const mock = require('mock-require');
const path = require('path');
const helper = require('think-helper');
const sleep = time => new Promise(resolve => setTimeout(resolve, time));

function getMaster() {
  return mock.reRequire('../../lib/master');
}

// test.afterEach.always(() => {
//   mock.stop('cluster');
// });

function mockCluster() {
  mock('cluster', {
    workers: [],
    fork(env = {}) {
      let worker = {
        on(evtName, cb) {
          this[evtName] = cb;
        },
        once(evtName, cb) {
          this.on(evtName, cb);
          if (evtName === 'listening') {
            cb('test address');
          }
        },
        trigger(evtName, args) {
          const cluster = require('cluster');
          if (evtName === 'exit') {
            const workers = Array.from(cluster.workers);
            cluster.workers.forEach((item, index) => {
              if (item === this) {
                workers.splice(index, 1);
              }
            });
            cluster.workers = workers;
          }
          this[evtName](args);
        },
        send(signal) {
          // console.log(signal);
        },
        kill() {
          // this.isKilled = true;
        },
        isConnected() {
          return !this.isKilled;
        },
        process: {
          kill: () => {
            worker.isKilled = true;
          }
        }
      };
      worker = Object.assign(worker, env);
      const cluster = require('cluster');
      cluster.workers.push(worker);
      return worker;
    },
    on: () => {},
    trigger(evtName, args) {
      this.workers.forEach(worker => {
        worker.trigger(evtName, args);
      });
    }
  });
}

function mockAssert(assertCallParams = []) {
  mock('assert', (type, desc) => {
    assertCallParams.push(type, desc);
  });
}

test('normal case', async t => {
  mockCluster();
  const cluster = require('cluster');
  const Master = getMaster();
  const instance = new Master();
  await instance.forkWorkers();
  cluster.trigger('message', 'think-graceful-disconnect');
  cluster.trigger('message', 'test');
  t.assert.strictEqual(cluster.workers[0].hasGracefulReload, undefined);
});

test('normal case #2', async t => {
  mockCluster();
  const cluster = require('cluster');
  const Master = getMaster();
  const instance = new Master();
  await instance.forkWorkers();
  t.assert.strictEqual(cluster.workers.length, require('os').cpus().length);
});

test('normal case #3', async t => {
  mockCluster();
  const cluster = require('cluster');
  const Master = getMaster();
  const instance = new Master();
  await instance.forkWorkers();
  cluster.trigger('message', 'think-graceful-disconnect');
  cluster.trigger('exit');
  t.assert.strictEqual(cluster.workers.length, require('os').cpus().length);
});

test('normal case #4', async t => {
  mockCluster();
  const cluster = require('cluster');
  const Master = getMaster();
  const instance = new Master({reloadSignal: 'SIGUSR2'});
  const listeners = new Set(process.listeners('SIGUSR2'));
  await instance.forkWorkers();
  const listener = process.listeners('SIGUSR2').find(item => !listeners.has(item));
  listener();
  process.removeListener('SIGUSR2', listener);
  t.assert.ok(true);
});

test('normal case #5', async t => {
  mockCluster();
  const cluster = require('cluster');
  const Master = getMaster();
  const instance = new Master({});
  await instance.forkWorkers();
  cluster.trigger('listening');
  t.assert.strictEqual(cluster.workers.length, require('os').cpus().length);
});

test('normal case #6', async t => {
  mockCluster();
  const cluster = require('cluster');
  const Master = getMaster();
  const instance = new Master({});
  await instance.forkWorkers();
  await instance.killWorker(cluster.workers[0]);
  await sleep(1000);
  t.assert.strictEqual(cluster.workers[0].isKilled, true);
});

test('normal case #7', async t => {
  mockCluster();
  const cluster = require('cluster');
  const Master = getMaster();
  const instance = new Master({});
  await instance.forkWorkers();
  await instance.killWorker(cluster.workers[0], true);
  await sleep(1000);
  await instance.killWorker(cluster.workers[0]);
  await sleep(1000);
  t.assert.strictEqual(cluster.workers[0].isKilled, true);
  t.assert.strictEqual(cluster.workers[0].hasGracefulReload, undefined);
});

test('normal case #8', async t => {
  mockCluster();
  const cluster = require('cluster');
  const Master = getMaster();
  const instance = new Master();
  await instance.forkWorkers();
  instance.forceReloadWorkers();
});

test('normal case #9', async t => {
  mockCluster();
  const cluster = require('cluster');
  const Master = getMaster();
  const instance = new Master({});
  await instance.forkWorkers();
  cluster.workers[0].state = 'disconnected';
  instance.forceReloadWorkers();
});

test('normal case #10', async t => {
  mockCluster();
  const cluster = require('cluster');
  const Master = getMaster();
  const instance = new Master({});
  await instance.forkWorkers();
  instance.forceReloadWorkers();
});

test('normal case #11', async t => {
  mockCluster();
  const cluster = require('cluster');
  const Master = getMaster();
  const instance = new Master({});
  await instance.forkWorkers();
  cluster.workers = [];
  instance.forceReloadWorkers();
});
