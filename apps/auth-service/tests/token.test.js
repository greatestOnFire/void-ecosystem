import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TokenService } from '../src/infrastructure/token.service.js';

test('TokenService: должен генерировать валидный JWT', async () => {
  const secret = 'test_secret_123_very_long_string';
  const service = new TokenService(secret);
  const payload = { email: 'dev@void.com' };

  const token = service.generateAccessToken(payload);
  const decoded = service.verifyToken(token);

  assert.strictEqual(decoded.email, 'dev@void.com');
});
