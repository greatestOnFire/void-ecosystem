import { test } from 'node:test';
import assert from 'node:assert/strict';
import { router } from '../src/router.js';
import { EventEmitter } from 'node:events';

/**
 * Имитация объекта запроса (Request)
 */
function createMockReq(method, url, body = {}) {
  const req = new EventEmitter();
  req.method = method;
  req.url = url;
  // Эмулируем поступление данных чанками
  setImmediate(() => {
    req.emit('data', JSON.stringify(body));
    req.emit('end');
  });
  return req;
}

/**
 * Имитация объекта ответа (Response)
 */
function createMockRes() {
  const res = {
    statusCode: 0,
    headers: {},
    body: '',
    writeHead(code, headers) {
      this.statusCode = code;
      this.headers = headers;
    },
    end(data) { this.body = data; }
  };
  return res;
}

test('Router: должен возвращать 201 при успешной регистрации', async () => {
  const req = createMockReq('POST', '/auth/register', { email: 'tdd@void.com', password: '123' });
  const res = createMockRes();

  const mockContext = {
    registerUser: {
      execute: async () => ({ sql: 'INSERT...', params: [] })
    },
    db: { query: async () => {} }
  };

  await router(req, res, mockContext);

  assert.strictEqual(res.statusCode, 201);
  assert.ok(JSON.parse(res.body).message);
});


test('Router: должен возвращать 200 и токены при успешном входе', async () => {
  const req = createMockReq('POST', '/auth/login', { email: 'tdd@void.com', password: '123' });
  const res = createMockRes();

  const mockContext = {
    loginUser: {
      execute: async () => ({ email: 'tdd@void.com' })
    },
    tokenService: {
      generateAccessToken: () => 'access_token_123'
    },
    sessionRepo: {
      save: async () => {}
    }
  };

  await router(req, res, mockContext);

  // ТЕСТ УПАДЕТ ТУТ: вернется 404 вместо 200
  assert.strictEqual(res.statusCode, 200);
  const body = JSON.parse(res.body);
  assert.strictEqual(body.accessToken, 'access_token_123');
});
