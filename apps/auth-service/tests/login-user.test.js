import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LoginUser } from '../src/use-cases/login-user.js';

test('LoginUser Use Case: должен возвращать пользователя при верном пароле', async () => {
  // Мокаем зависимости
  const mockUser = { email: 'dev@void.com', passwordHash: 'hashed_abc' };
  const mockRepo = { findByEmail: async () => mockUser };
  const mockPasswordService = { verify: async () => true };

  const useCase = new LoginUser(mockRepo, mockPasswordService);

  const user = await useCase.execute({ email: 'dev@void.com', password: '123' });

  assert.strictEqual(user.email, 'dev@void.com');
});
