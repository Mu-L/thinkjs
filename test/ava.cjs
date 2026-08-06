const {default: ava} = require('ava');

function legacyContext(t) {
  return new Proxy(t, {
    get(target, property) {
      const value = target[property];
      if (['true', 'false', 'truthy', 'falsy'].includes(property) && typeof value === 'function') {
        return (actual, message) => value.call(
          target,
          actual,
          typeof message === 'string' ? message : undefined
        );
      }
      if (property !== 'throws' || typeof value !== 'function') {
        return typeof value === 'function' ? value.bind(target) : value;
      }

      return (thrower, expectation, message) => {
        if (typeof expectation === 'string') {
          return value.call(target, thrower, undefined, expectation);
        }
        if (typeof expectation === 'function') {
          return value.call(target, thrower, {instanceOf: expectation}, message);
        }
        return value.call(target, thrower, expectation, message);
      };
    }
  });
}

function runTest(callback, callbackMode) {
  return t => new Promise((resolve, reject) => {
    const context = legacyContext(t);
    if (callbackMode) {
      Object.defineProperty(t, 'end', {
        configurable: true,
        value: resolve
      });
    }

    try {
      const result = callback(context);
      if (result && typeof result.then === 'function') {
        result.then(resolve, reject);
      } else if (!callbackMode) {
        resolve(result);
      }
    } catch (error) {
      reject(error);
    }
  });
}

function wrap(target, callbackMode = false) {
  return new Proxy(target, {
    apply(fn, thisArg, argumentsList) {
      const args = [...argumentsList];
      const callback = args.pop();
      if (typeof callback !== 'function') {
        return Reflect.apply(fn, thisArg, argumentsList);
      }
      args.push(runTest(callback, callbackMode));
      return Reflect.apply(fn, thisArg, args);
    },
    get(fn, property) {
      if (property === 'cb') return wrap(fn, true);

      const value = fn[property] === undefined ? ava[property] : fn[property];
      if (typeof value === 'function') return wrap(value, callbackMode);
      return value;
    }
  });
}

module.exports = wrap(ava);
