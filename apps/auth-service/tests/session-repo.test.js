import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { redis } from '../src/infrastructure/redis.js';
import { SessionRepository } from '../src/infrastructure/session.repository.js';

test('SessionRepository: должен сохранять и удалять сессии в Redis', async () => {
  const repo = new SessionRepository(redis);
  const sessionId = 'test-session-123';
  const userId = 'user-456';

  // 1. Сохраняем сессию на 1 минуту (60 сек)
  await repo.save(sessionId, userId, 60);

  // 2. Проверяем наличие
  const savedUserId = await repo.findUserId(sessionId);
  assert.strictEqual(savedUserId, userId);

  // 3. Удаляем (Logout)
  await repo.delete(sessionId);
  const deletedUserId = await repo.findUserId(sessionId);
  assert.strictEqual(deletedUserId, null);
});

after(() => redis.disconnect());
