const {test} = require('node:test');
const mock = require('mock-require');
const path = require('path');
const helper = require('think-helper');
const sleep = time => new Promise(resolve => setTimeout(resolve, time));
function getWorker() {
  return mock.reRequire('../../lib/worker');
}

// test.afterEach.always(() => {
//   mock.stop('cluster');
// });

function mockCluster() {
  mock('cluster', {
    worker: {
      send() {},
      once() {},
      on(evtName, cb) {
        this[evtName] = cb;
      },
      trigger(evtName, args) {
        this[evtName](args);
      },
      disconnect() {}
    },
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
      cluster.worker = worker;
      return worker;
    },
    trigger(evtName, args) {
      this.workers.forEach(worker => {
        worker.trigger(evtName, args);
      });
    }
  });
}

function mockProcess() {
  process.on = (evtName, cb) => {
    process[evtName] = cb;
  };

  process.once = (evtName, cb) => {
    process[evtName] = cb;
  };

  process.exit = () => {
    process.isKilled = true;
  };

  process.trigger = (evtName, args = {}) => {
    process['is' + evtName] = true;
    process[evtName](args);

    // if(evtName === 'uncaughtException'){
    //   process[evtName](args);
    // }else if(evtName === 'message'){
    //   process[evtName](args)
    // }
  };
}

// const defaultConfig = {
//   server:{
//     address:'http://localhost:8080'
//   },
//   onUnhandledRejection:(e)=>{
//     console.log('aaaa');
//   }
// };

function mockAssert(assertCallParams = []) {
  mock('assert', (type, desc) => {
    assertCallParams.push(type, desc);
  });
}

test('normal case 7', async t => {
  let unhandledRejectionDid = false;
  const config = {
    server: {
      address: 'http://localhost:8080'
    },
    onUnhandledRejection: (e) => {
      unhandledRejectionDid = true;
    }
  };
  const cluster = require('cluster');
  const Worker = getWorker();
  const instance = new Worker(config);
  instance.captureEvents();

  const handler = process.listeners('unhandledRejection').at(-1);
  handler(new Error('Silence me'));
  t.assert.strictEqual(unhandledRejectionDid, true);
});

test('normal case 8', async t => {
  mockCluster();

  const config = {
    server: {
      address: 'http://localhost:8080',
      req: {},
      res: {
        setHeader(key, value) {
          this[key] = value;
        }
      },
      on(evtName, cb) {
        this[evtName] = cb;
      },
      close() {

      },
      trigger(eveName) {
        this[eveName](this.req, this.res);
      }
    },
    onUnhandledRejection: (e) => {
      unhandledRejectionDid = true;
    }
  };

  const cluster = require('cluster');
  const Worker = getWorker();
  const instance = new Worker(config);
  instance.server = config.server;
  cluster.fork();
  instance.disconnectWorker(true);
  cluster.trigger('message', 'think-graceful-fork');
  config.server.trigger('request');

  t.assert.strictEqual(config.server.res.Connection, 'close');
});

test('normal case 3', async t => {
  mockProcess();
  mockCluster();

  const config = {
    server: {
      address: 'http://localhost:8080',
      req: {},
      res: {
        setHeader(key, value) {
          this[key] = value;
        }
      },
      on(evtName, cb) {
        this[evtName] = cb;
      },
      close() {

      },
      trigger(eveName) {
        this[eveName](this.req, this.res);
      }
    },
    onUnhandledRejection: (e) => {
      unhandledRejectionDid = true;
    },
    processKillTimeout: null
  };

  const cluster = require('cluster');
  const Worker = getWorker();
  const instance = new Worker(config);
  instance.server = config.server;
  cluster.fork();
  instance.disconnectWorker(false);
});

test('normal case 2', async t => {
  mockCluster();

  const config = {
    server: {
      address: 'http://localhost:8080',
      req: {},
      res: {
        setHeader(key, value) {
          this[key] = value;
        }
      },
      on(evtName, cb) {
        this[evtName] = cb;
      },
      close() {

      },
      trigger(eveName) {
        this[eveName](this.req, this.res);
      }
    },
    onUnhandledRejection: (e) => {
      unhandledRejectionDid = true;
    }
  };

  const cluster = require('cluster');
  const Worker = getWorker();
  const instance = new Worker(config);
  cluster.fork();
  process.env.THINK_WORKERS = 1;
  t.assert.strictEqual(+instance.getWorkers(), 1);
});

test('onUncaughtException case', async t => {
  mockCluster();
  mockProcess();
  // let triggerException = false;

  const config = {
    server: {
      address: 'http://localhost:8080',
      req: {},
      res: {
        setHeader(key, value) {
          this[key] = value;
        }
      },
      on(evtName, cb) {
        this[evtName] = cb;
      },
      close() {

      },
      trigger(eveName) {
        this[eveName](this.req, this.res);
      }
    },
    onUnhandledRejection: (e) => {
      unhandledRejectionDid = true;
    }
  };

  const Worker = getWorker();
  const instance = new Worker(config);
  instance.captureEvents();

  process.trigger('uncaughtException');
  t.assert.strictEqual(process['isuncaughtException'], true);
});

test('onUncaughtException case #2', async t => {
  mockCluster();
  mockProcess();
  const config = {
    server: {
      address: 'http://localhost:8080',
      req: {},
      res: {
        setHeader(key, value) {
          this[key] = value;
        }
      },
      on(evtName, cb) {
        this[evtName] = cb;
      },
      close() {

      },
      trigger(eveName) {
        this[eveName](this.req, this.res);
      }
    },
    onUnhandledRejection: (e) => {
      unhandledRejectionDid = true;
    },
    debug: true
  };

  const Worker = getWorker();
  const instance = new Worker(config);
  instance.captureEvents();

  process.trigger('uncaughtException');
  t.assert.strictEqual(process['isuncaughtException'], true);
});

test('captureReloadSignal case', async t => {
  mockCluster();
  mockProcess();
  const config = {
    server: {
      address: 'http://localhost:8080',
      req: {},
      res: {
        setHeader(key, value) {
          this[key] = value;
        }
      },
      on(evtName, cb) {
        this[evtName] = cb;
      },
      close() {

      },
      trigger(eveName) {
        this[eveName](this.req, this.res);
      }
    },
    onUnhandledRejection: (e) => {
      unhandledRejectionDid = true;
    }
  };

  const Worker = getWorker();
  const instance = new Worker(config);
  instance.captureEvents();

  process.trigger('message', 'think-reload-signal');
  process.trigger('message', 'something');
  t.assert.strictEqual(process['ismessage'], true);
});

test('closeServer case 1', async t => {
  mockCluster();
  mockProcess();
  const config = {
    server: {
      address: 'http://localhost:8080',
      req: {},
      res: {
        setHeader(key, value) {
          this[key] = value;
        }
      },
      on(evtName, cb) {
        this[evtName] = cb;
      },
      close() {

      },
      trigger(eveName) {
        this[eveName](this.req, this.res);
      }
    }
  };

  const Worker = getWorker();
  const instance = new Worker(config);
  instance.server = config.server;

  instance.closeServer();

  await sleep(1000);

  t.assert.strictEqual(process.isKilled, undefined);
});

test('closeServer case 4', async t => {
  mockCluster();
  mockProcess();
  const config = {
    server: {
      address: 'http://localhost:8080',
      req: {},
      res: {
        setHeader(key, value) {
          this[key] = value;
        }
      },
      on(evtName, cb) {
        this[evtName] = cb;
      },
      close() {

      },
      trigger(eveName) {
        this[eveName](this.req, this.res);
      }
    },
    processKillTimeout: 50
  };

  const Worker = getWorker();
  const instance = new Worker(config);
  instance.server = config.server;

  instance.closeServer();

  await sleep(1000);

  t.assert.strictEqual(process.isKilled, true);
});

test('closeServer case 2', async t => {
  mockCluster();
  mockProcess();
  const config = {
    server: {
      address: 'http://localhost:8080',
      req: {},
      res: {
        setHeader(key, value) {
          this[key] = value;
        }
      },
      on(evtName, cb) {
        this[evtName] = cb;
      },
      close() {

      },
      trigger(eveName) {
        this[eveName](this.req, this.res);
      }
    },
    processKillTimeout: 50
  };

  const Worker = getWorker();
  const instance = new Worker(config);
  instance.server = config.server;

  instance.closeServer();

  await sleep(1000);

  t.assert.strictEqual(process.isKilled, true);
});

test('closeServer case 3', async t => {
  mockCluster();
  mockProcess();
  const config = {
    server: {
      address: 'http://localhost:8080',
      req: {},
      res: {
        setHeader(key, value) {
          this[key] = value;
        }
      },
      on(evtName, cb) {
        this[evtName] = cb;
      },
      close(cb) {
        cb();
      },
      trigger(eveName) {
        this[eveName](this.req, this.res);
      }
    },
    processKillTimeout: null
  };

  const cluster = require('cluster');
  const Worker = getWorker();
  const instance = new Worker(config);
  instance.server = config.server;

  instance.closeServer();

  cluster.worker.trigger('disconnect');
  t.assert.strictEqual(process.isKilled, true);
});

test('closeServer case 5', async t => {
  mockCluster();
  mockProcess();
  const config = {
    server: {
      address: 'http://localhost:8080',
      req: {},
      res: {
        setHeader(key, value) {
          this[key] = value;
        }
      },
      on(evtName, cb) {
        this[evtName] = cb;
      },
      close(cb) {
        cb();
      },
      trigger(eveName) {
        this[eveName](this.req, this.res);
      }
    },
    disableKeepAlive: true
  };

  const cluster = require('cluster');
  const Worker = getWorker();
  const instance = new Worker(config);
  instance.captureEvents();
});
