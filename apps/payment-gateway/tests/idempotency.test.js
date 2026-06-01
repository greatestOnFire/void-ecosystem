import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TransferFunds } from '../src/use-cases/transfer-funds.js';

test('TransferFunds: должен возвращать сохраненный результат для того же idempotencyKey', async () => {
  const idempotencyKey = 'unique-key-123';

  // Имитируем Redis, в котором этот ключ уже сохранен (эмуляция повторного запроса)
  const mockRedis = {
    get: async (key) => {
      if (key === `idemp:${idempotencyKey}`) {
        return JSON.stringify({ success: true, cached: true });
      }
      return null;
    },
    set: async () => {}
  };

  // Передаем мок Redis в Use Case
  const useCase = new TransferFunds({
    walletRepo: {},
    transactionRepo: {},
    db: {},
    redis: mockRedis
  });

  const result = await useCase.execute({
    fromWalletId: 's1',
    toWalletId: 'r1',
    amount: 100,
    idempotencyKey // Наш новый обязательный параметр
  });

  // Тест упадет тут (RED), так как Use Case сейчас проигнорирует ключ и пойдет искать кошельки в пустом репозитории
  assert.strictEqual(result.cached, true);
});
