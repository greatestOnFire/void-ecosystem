import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CreateWallet } from '../src/use-cases/create-wallet.js';

test('CreateWallet Use Case: должен создавать SQL для нового кошелька', async () => {
  // Мокаем репозиторий (имитируем его поведение)
  const mockRepo = {
    save: (wallet) => ({
      sql: 'INSERT INTO wallets (user_id, balance) VALUES ($1, $2)',
      params: [wallet.userId, wallet.balance]
    })
  };

  const useCase = new CreateWallet(mockRepo);
  const result = await useCase.execute({ userId: 100 });

  assert.strictEqual(result.params[0], 100); // userId
  assert.strictEqual(result.params[1], 0);   // Начальный баланс должен быть 0
  assert.ok(result.sql.includes('INSERT INTO wallets'));
});
