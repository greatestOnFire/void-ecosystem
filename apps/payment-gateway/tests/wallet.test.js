import { test } from 'node:test';
import assert from 'node:assert/strict';

import { Wallet } from '../src/domain/wallet.entity.js';

test('Wallet Entity: должен выбрасывать ошибку при попытке установить отрицательный баланс', () => {
  assert.throws(() => {
    new Wallet({ userId: 1, balance: -100 });
  }, {
    message: 'Balance cannot be negative'
  });
});

test('Wallet Entity: должен успешно создавать объект кошелька', () => {
  const wallet = new Wallet({ userId: 1, balance: 500 });
  assert.strictEqual(wallet.balance, 500);
});
