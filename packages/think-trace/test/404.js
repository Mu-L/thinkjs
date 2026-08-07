const fs = require('fs');
const {test, before, after} = require('node:test');
const Trace = require('../lib');

const filename = `${__dirname}/notfound.html`;

before(() => {
  try {
    fs.statSync(filename);
    fs.unlinkSync(filename);
  } catch (e) {

  } finally {
    fs.writeFileSync(filename, '{{errMsg}}', {encoding: 'utf-8'});
  }
});

test('404 #2', async t => {
  t.plan(2);
  const ctx = {
    path: '/index',
    res: {
      statusCode: 404
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
    return true;
  };

  try {
    await Trace({
      templates: {404: filename},
      error() {}
    })(ctx, next);
  } catch (e) {

  }

  t.assert.strictEqual(ctx.body, 'Error: url `/index` not found.');

  try {
    await Trace({
      debug: false,
      templates: {404: filename},
      error() {}
    })(ctx, next);
  } catch (e) {

  }
  t.assert.strictEqual(ctx.body, '');
});

after(() => fs.unlinkSync(filename));
