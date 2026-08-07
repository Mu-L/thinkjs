const {test} = require('node:test');
const mock = require('mock-require');
const http = require('http');
const IncomingMessage = http.IncomingMessage;
const ServerResponse = http.ServerResponse;

function getMockHttp() {
  return mock.reRequire('../index');
}

test('test case', t => {
  let mockHttp = getMockHttp();
  let request = null , response = null;
  let app = {
    callback:()=>{
      return (req,res)=>{
        request = req;
        response = res;
      }
    }
  };
  mockHttp(JSON.stringify({url:'./test'}),app);

  t.assert.strictEqual(request instanceof IncomingMessage,true);
  t.assert.strictEqual(request.url,'./test');
  t.assert.strictEqual(response instanceof ServerResponse,true);
});

test('test case #2', t => {
  let mockHttp = getMockHttp();
  let request = null , response = null;
  let app = {
    callback:()=>{
      return (req,res)=>{
        request = req;
        response = res;
      }
    }
  };
  mockHttp('url=./test',app);

  t.assert.strictEqual(request instanceof IncomingMessage,true);
  t.assert.strictEqual(request.url,'./test');
  t.assert.strictEqual(response instanceof ServerResponse,true);
});

test('test case #3', t => {
  let mockHttp = getMockHttp();
  let request = null , response = null;
  let app = {
    callback:()=>{
      return (req,res)=>{
        request = req;
        response = res;
      }
    }
  };
  mockHttp('./test',app);

  t.assert.strictEqual(request instanceof IncomingMessage,true);
  t.assert.strictEqual(request.url,'./test');
  t.assert.strictEqual(response instanceof ServerResponse,true);
});

test('test case #4', t => {
  let mockHttp = getMockHttp();
  let request = null , response = null;
  let app = {
    callback:()=>{
      return (req,res)=>{
        request = req;
        response = res;
      }
    }
  };
  mockHttp({url:'./test'},app);

  t.assert.strictEqual(request instanceof IncomingMessage,true);
  t.assert.strictEqual(request.url,'./test');
  t.assert.strictEqual(response instanceof ServerResponse,true);
});

test('test case #5', t => {
  let mockHttp = getMockHttp();
  let {req,res} = mockHttp('./test');
  t.assert.strictEqual(req instanceof IncomingMessage,true);
  t.assert.strictEqual(req.url,'./test');
  t.assert.strictEqual(res instanceof ServerResponse,true);
});