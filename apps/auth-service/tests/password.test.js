import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PasswordService } from '../src/infrastructure/password.service.js';

test('PasswordService: должен создавать хэш и успешно его проверять', async () => {
  const service = new PasswordService();
  const password = 'super-secret-password';

  const hash = await service.hash(password);

  assert.notStrictEqual(hash, password); // Хэш не должен быть равен паролю
  assert.strictEqual(await service.verify(hash, password), true); // Верный пароль
  assert.strictEqual(await service.verify(hash, 'wrong-password'), false); // Неверный пароль
});
