import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../src/infrastructure/db.js';
import { UserRepository } from '../src/infrastructure/user.repository.js';
import { User } from '../src/domain/user.entity.js';

test('Integration: UserRepository должен сохранять пользователя в реальный Postgres', async () => {
  const repo = new UserRepository();
  const testEmail = `test-${Date.now()}@void.com`;

  const user = new User({
    email: testEmail,
    passwordHash: 'hash_123'
  });

  // 1. Получаем SQL через наш Query Builder внутри Repo
  const { sql, params } = repo.save(user);

  // 2. ВЫПОЛНЯЕМ реальный запрос в Docker
  await db.query(sql, params);

  // 3. ПРОВЕРЯЕМ наличие записи в базе через SELECT
  const result = await db.query('SELECT * FROM users WHERE email = $1', [testEmail]);

  assert.strictEqual(result.rows.length, 1);
  assert.strictEqual(result.rows[0].email, testEmail);
});

// Закрываем соединение после теста, чтобы Node.js не завис
after(async () => {
  await db.close();
});
