const fs = require('fs');
const {test, before, after} = require('node:test');
const Trace = require('../lib');

const filename = `${__dirname}/test.html`;

before(() => {
  try {
    fs.statSync(filename);
    fs.unlinkSync(filename);
  } catch (e) {

  } finally {
    fs.writeFileSync(filename, '{{errMsg}}{{error}}', {encoding: 'utf-8'});
  }
});

test('500 #2', async t => {
  t.plan(2);

  const ctx = {
    res: {
      statusCode: 200
    },
    req: {
      'content-type': 'html;charset=utf-8'
    },
    throw(statusCode, msg) {
      const err = new Error(msg);
      err.status = statusCode;
      throw err;
    },
    response: {
      is() {
        return false;
      }
    }
  };
  const next = (instance) => {
    throw new Error('normal trace test');
  };

  try {
    await Trace({
      templates: {500: filename}
    })(ctx, next);
  } catch (e) {

  }
  const result = ctx.body;
  t.assert.strictEqual(result.includes('normal trace test'), true);

  try {
    await Trace({
      debug: false,
      templates: {500: filename}
    })(ctx, next);
  } catch (e) {

  }

  t.assert.strictEqual(ctx.body, '[]');
});

after(() => fs.unlinkSync(filename));

test('500 not exist file', async t => {
  const ctx = {
    res: {
      statusCode: 200
    },
    response: {
      is() {
        return false;
      }
    }
  };
  const next = (instance) => {
    throw new Error('normal trace test');
  };

  try {
    await Trace({
      templates: {
        404: __dirname + 'notexist.html',
        500: __dirname + 'notexist.html'
      }
    })(ctx, next);
  } catch (e) {

  }
  const result = ctx.body;
  t.assert.strictEqual(result.includes('thinkjs'), true);
});
