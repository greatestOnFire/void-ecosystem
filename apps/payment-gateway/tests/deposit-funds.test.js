import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DepositFunds } from '../src/use-cases/deposit-funds.js';

test('DepositFunds Use Case: должен подготовить SQL для пополнения', async () => {
  const mockTxRepo = {
    save: (tx ,status) => ({
      sql: `INSERT INTO `,
      params: [],
    })
  };

  const useCase = new DepositFunds(mockTxRepo);
  const result = await useCase.execute({ walletId: 'w1', amount: 100 });

  assert.ok(result.tx.sql.includes('INSERT INTO transactions'));
});
