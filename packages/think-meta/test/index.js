const {test} = require('node:test');
const Meta = require('../');
const helper = require('think-helper');
function getApp() {
	return {
		think: {
			version: '3.0.0alpha',
			logger: {
				info(info) {
					this.infomsg = info;
				}
			}
		}
	}
}
function getCtx() {
	return {
		res: {
			headers: {},
			setHeader(k, v) {
				this.headers[k] = v;
			},
			setTimeout(ms, fun) {
				setTimeout(fun, ms);
			}
		},
		method: 'get',
		url: 'url',
		status: '200'
	}
}

test('default option', async t => {
	let ctx = getCtx();
	let app = getApp();
	let next = () => {
		return Promise.resolve();
	};

	await Meta({}, app)(ctx, next);

	t.assert.strictEqual(ctx.res.headers['X-Powered-By'], `thinkjs-${app.think.version}`, '成功设置X-Powered-By');
	t.assert.ok(ctx.res.headers['X-Response-Time'], '成功设置X-Response-Time');
	await helper.timeout(10);
	t.assert.ok(app.think.logger.infomsg, '成功log');
});
test('default option with err', async t => {
	let ctx = getCtx();
	let app = getApp();
	let next = () => {
		return Promise.resolve().then(() => {
			throw new Error('err');
		});
	};

	await Meta({}, app)(ctx, next).catch((err) => {
		// console.log(err);
	});
	await helper.timeout(10);
	t.assert.strictEqual(ctx.res.headers['X-Powered-By'], `thinkjs-${app.think.version}`, '有报错成功设置X-Powered-By');
	t.assert.ok(ctx.res.headers['X-Response-Time'], '有报错成功设置X-Response-Time');
	t.assert.ok(app.think.logger.infomsg, '有报错成功log');
});
test('with TimeoutCallback', async t => {
	let ctx = getCtx();
	let app = getApp();
	let callbacked = false;
	await Meta({
		requestTimeoutCallback() {
			callbacked = true;
		},
		requestTimeout: 6 * 1000,
	}, app)(ctx, () => {
		let promise = new Promise(function(resolve) {
			setTimeout(function() {
				resolve();
			}, 6 * 1000 + 100);
		});
		return promise;
	});
  t.assert.strictEqual(callbacked, true, '超时调用回调函数');

	callbacked = false;
	await Meta({
		requestTimeoutCallback() {
			callbacked = true;
		},
		requestTimeout: 6 * 1000,
  }, app)(ctx, () => {
	  	let promise = new Promise(function(resolve) {
	  		setTimeout(function() {
	  			resolve();
	  		}, 6 * 1000 - 100);
	  	});
	    return promise;
	});
	await helper.timeout(10);
  t.assert.strictEqual(callbacked, false, '未超时不调用回调函数');
});

test('with TimeoutCallback 2', async t => {
	let ctx = getCtx();
	let app = getApp();
	let callbacked = false;
	await Meta({
		requestTimeoutCallback: null,
		requestTimeout: 5 * 1000,
	}, app)(ctx, () => {
		let promise = new Promise(function(resolve) {
			setTimeout(function() {
				resolve();
			}, 7 * 1000 + 100);
		});
		return promise;
	});
  t.assert.strictEqual(!callbacked, true, '超时调用回调函数');
});
test('settings', async t => {
	let ctx = getCtx();
	let app = getApp();
	let next = () => {
		return Promise.resolve();
	};
	await Meta({
		sendPowerBy: false,
		sendResponseTime: false,
		logRequest: false,
	}, app)(ctx, next);
	await helper.timeout(10);
	t.assert.strictEqual(ctx.res.headers['X-Powered-By'], undefined, '不设置X-Powered-By');
	t.assert.strictEqual(ctx.res.headers['X-Response-Time'], undefined, '不设置X-Response-Time');
	t.assert.strictEqual(app.think.logger.infomsg, undefined, '不log');
});
test('settings2', async t => {
	let ctx = getCtx();
	let app = getApp();
	let next = () => {
		return Promise.resolve();
	};
	await Meta({
		sendPowerBy: false,
		sendResponseTime: true,
		logRequest: false,
	}, app)(ctx, next);
	await helper.timeout(10);
	t.assert.strictEqual(ctx.res.headers['X-Powered-By'], undefined, '不设置X-Powered-By');
	t.assert.ok(ctx.res.headers['X-Response-Time'], '设置X-Response-Time');
	t.assert.strictEqual(app.think.logger.infomsg, undefined, '不log');
});
test('settings3', async t => {
	let ctx = getCtx();
	let app = getApp();
	let next = () => {
		return Promise.resolve();
	};
	await Meta({
		sendPowerBy: false,
		sendResponseTime: false,
		logRequest: true,
	}, app)(ctx, next);
	await helper.timeout(10);
	t.assert.strictEqual(ctx.res.headers['X-Powered-By'], undefined, '不设置X-Powered-By');
	t.assert.strictEqual(ctx.res.headers['X-Response-Time'], undefined, '设置X-Response-Time');
	t.assert.ok(app.think.logger.infomsg, 'log');
});
