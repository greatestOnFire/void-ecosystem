import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Transaction } from '../src/domain/transaction.entity.js';

test('Transaction Entity: должен успешно создаваться с валидными данными', () => {
  const data = {
    walletId: 'uuid-123',
    amount: 1000,
    type: 'DEPOSIT'
  };
  const tx = new Transaction(data);
  assert.strictEqual(tx.amount, 1000);
});

test('Transaction Entity: должен выбрасывать ошибку, если сумма отрицательная или ноль', () => {
  assert.throws(() => new Transaction({amount: -50}), { message: 'Amount must be positive'})
});
