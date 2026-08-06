'use strict';

const Koa = require('koa');
const test = require('../../../test/ava.cjs');
const serve = require('..');
const request = require('supertest');
const helper = require('think-helper');
const fs = require('fs');
const os = require('os');
const path = require('path');

const extensionRoot = path.join(os.tmpdir(), `think-resource-assets-${process.pid}`);
const servers = new Set();
test.before(() => fs.cpSync(path.join(__dirname, 'assets'), extensionRoot, {recursive: true}));
test.afterEach.always(async () => {
  await Promise.all([...servers].map(server => new Promise((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
  })));
  servers.clear();
});
test.after.always(() => fs.rmSync(extensionRoot, {force: true, recursive: true}));

function createServer (options, middlewares = [], callback) {
  const app = new Koa();
  if (helper.isFunction(middlewares)) {
    callback = middlewares;
    middlewares = [];
  }
  if (!helper.isArray(middlewares)) {
    middlewares = [];
  }
  middlewares.unshift(serve(options));
  middlewares.forEach(middleware => {
    app.use(middleware);
  });
  const server = app.listen(function () {
    if (helper.isFunction(callback)) {
      callback(this);
    }
  });
  servers.add(server);
  return server;
}

test.cb('serve by no options"."', t => {
  t.plan(1);
  try {
    createServer();
    t.fail();
  }
  catch (e) {
    t.pass();
  }
  t.end();
});

test.cb('serve by root:"."', t => {
  t.plan(1);
  request(createServer({ root: '.' }))
    .get('/package.json')
    .expect(200, (err, res) => {
      if (err) {
        t.fail();
      }
      else {
        t.pass();
      }
      t.end();
    });
});

test.cb('serve by path:"not a file"', t => {
  t.plan(1);
  request(createServer({ root: 'test/assets' }))
    .get('/errpath.txt')
    .expect(404, (err, res) => {
      if (err) {
        t.fail();
      }
      else {
        t.pass();
      }
      t.end();
    });
});

test.cb('serve by invalid path', t => {
  t.plan(1)
  request(createServer({ root: 'test/assets' }))
    .get('/%fdsa')
    .expect(400, (err, res) => {
      if (err) {
        t.fail();
      }
      else {
        t.pass();
      }
      t.end();
    });
});

test.cb('serve by valid path', t => {
  t.plan(1)
  request(createServer({ root: 'test/assets' }))
    .get('/1.txt')
    .expect(200)
    .expect('txt hello', (err, res) => {
      if (err) {
        t.fail();
      }
      else {
        t.pass();
      }
      t.end();
    });
});

test.cb('serve by upstream middleware responds', t => {
  t.plan(1);
  request(createServer({ root: 'test/assets' }, [ (ctx, next) => {
    return next().then(() => {
      ctx.body = 'hi';
    });
  } ]))
    .get('/1.txt')
    .expect(200)
    .expect('txt hello', (err, res) => {
      if (err) {
        t.fail();
      }
      else {
        t.pass();
      }
      t.end();
    });
});

test.cb('serve by index', t => {
  t.plan(1);
  request(createServer({ root: 'test/assets', index: 'index.txt' }))
    .get('/')
    .expect(200)
    .expect('Content-Type', 'text/plain; charset=utf-8')
    .expect('index', (err, res) => {
      if (err) {
        t.fail();
      }
      else {
        t.pass();
      }
      t.end();
    });
});

test.cb('serve by index html', t => {
  t.plan(1);
  request(createServer({ root: 'test/assets' }))
    .get('/html/')
    .expect(200)
    .expect('Content-Type', 'text/html; charset=utf-8')
    .expect('index html world', (err, res) => {
      if (err) {
        t.fail();
      }
      else {
        t.pass();
      }
      t.end();
    });
});

test.cb('serve by disabled index', t => {
  t.plan(1);
  request(createServer({ root: 'test/assets', index: false }))
    .get('/html/')
    .expect(404, (err, res) => {
      if (err) {
        t.fail();
      }
      else {
        t.pass();
      }
      t.end();
    });
});

test.cb('serve by POST method', t => {
  t.plan(1);
  request(createServer({ root: 'test/assets' }))
    .post('/1.txt')
    .expect(404, (err, res) => {
      if (err) {
        t.fail();
      }
      else {
        t.pass();
      }
      t.end();
    });
});

test.cb('serve by publicPath', t => {
  t.plan(1);
  request(createServer({ root: 'test/assets', publicPath: '/1.txt' }))
    .get('/1.txt')
    .expect(200, (err, res) => {
      if (err) {
        t.fail();
      }
      else {
        t.pass();
      }
      t.end();
    });
});

test.cb('serve by publicPath #2', t => {
  t.plan(1);
  request(createServer({ root: 'test/assets', publicPath: /1\.txt/ }))
    .get('/1.txt')
    .expect(200, (err, res) => {
      if (err) {
        t.fail();
      }
      else {
        t.pass();
      }
      t.end();
    });
});

test.cb('serve by publicPath #3', t => {
  t.plan(1);
  request(createServer({ root: 'test/assets', publicPath: /^\/html\/index.html/ }))
    .get('/html/index.html')
    .expect(200, (err, res) => {
      if (err) {
        t.fail();
      }
      else {
        t.pass();
      }
      t.end();
    });
});

test.cb('serve by publicPath #4', t => {
  t.plan(1);
  request(createServer({ root: 'test/assets', publicPath: '1.txt' }))
    .get('/1.txt')
    .expect(200, (err, res) => {
      if (err) {
        t.fail();
      }
      else {
        t.pass();
      }
      t.end();
    });
});

test.cb('serve by format:"true"', t => {
  t.plan(1);
  request(createServer({ root: 'test/assets', format: true }))
    .get('/html')
    .expect(200, (err, res) => {
      if (err) {
        t.fail();
      }
      else {
        t.pass();
      }
      t.end();
    });
});


test.cb('serve by format:"false"', t => {
  t.plan(1);
  request(createServer({ root: 'test/assets', format: false }))
    .get('/html')
    .expect(404, (err, res) => {
      if (err) {
        t.fail();
      }
      else {
        t.pass();
      }
      t.end();
    });
});

test.cb('serve by setHeaders:"true"', t => {
  t.plan(1);
  request(createServer({ root: 'test/assets', setHeaders: true }))
    .get('/html')
    .expect(500, (err, res) => {
      if (err) {
        t.fail();
      }
      else {
        t.pass();
      }
      t.end();
    });
});

test.cb('serve by gzip', t => {
  t.plan(1);
  request(createServer({ root: 'test/assets', gzip: true }))
    .get('/gzip.json')
    .expect(200, (err, res) => {
      if (err) {
        t.fail();
      }
      else {
        t.pass();
      }
      t.end();
    });
});

test('serve by extensions', async t => {
  await request(createServer({ root: extensionRoot, extensions: ['.html', 'txt'] }))
    .get('/index')
    .expect(200);
  t.pass();
});

test.cb('serve by extensions fail', t => {
  t.plan(1);
  request(createServer({ root: extensionRoot, extensions: ['txt'] }))
    .get('/test')
    .expect(404, (err, res) => {
      if (err) {
        t.fail();
      }
      else {
        t.pass();
      }
      t.end();
    });
});

test.cb('serve by extensions err', t => {
  t.plan(1);
  request(createServer({ root: extensionRoot, extensions: [2, {}, []] }))
    .get('/index')
    .expect(500, (err, res) => {
      if (err) {
        t.fail();
      }
      else {
        t.pass();
      }
      t.end();
    });
});

test.cb('serve by hidden file', t => {
  t.plan(1);
  request(createServer({ root: 'test/assets', hidden: true }))
    .get('/.hidden')
    .expect(200, (err, res) => {
      if (err) {
        t.fail();
      }
      else {
        t.pass();
      }
      t.end();
    });
});

test.cb('serve by hidden file #2', t => {
  t.plan(1);
  request(createServer({ root: 'test/assets', hidden: false }))
    .get('/.hidden')
    .expect(404, (err, res) => {
      if (err) {
        t.fail();
      }
      else {
        t.pass();
      }
      t.end();
    });
});

test.cb('serve by notFoundNext', t => {
  t.plan(1)
  request(createServer({ root: 'test/assets', notFoundNext: true }))
    .get('/1.txt')
    .expect(200)
    .expect('txt hello', (err, res) => {
      if (err) {
        t.fail();
      }
      else {
        t.pass();
      }
      t.end();
    });
});

test.cb('serve by notFoundNext #2', t => {
  t.plan(1)
  request(createServer({ root: 'test/assets', notFoundNext: true }))
    .get('/1.txt1')
    .expect(404, (err, res) => {
      if (err) {
        t.fail();
      }
      else {
        t.pass();
      }
      t.end();
    });
});
