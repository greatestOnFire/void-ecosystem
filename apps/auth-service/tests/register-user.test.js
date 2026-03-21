import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RegisterUser } from '../src/use-cases/register-user.js';

test('RegisterUser Use Case: должен успешно подготовить данные для регистрации', async () => {
  // Имитируем зависимости (Dependency Injection)
  const mockRepo = {
    save: (user) => (
      { sql: 'INSERT INTO users (email) VALUES ($1)', params: [user.email] }
    )
  };
  const mockPasswordService = { hash: async () => 'hashed_password' };

  const useCase = new RegisterUser(mockRepo, mockPasswordService);

  const result = await useCase.execute({
    email: 'new-engineer@void.com',
    password: 'secure-password'
  });

  assert.strictEqual(result.params[0], 'new-engineer@void.com');
  assert.ok(result.sql.includes('INSERT INTO users'));
});
