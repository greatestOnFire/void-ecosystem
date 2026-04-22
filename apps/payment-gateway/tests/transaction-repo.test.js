import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QueryBuilder } from '@void/core-query-builder';
import { TransactionRepository } from '../src/infrastructure/transaction.repository.js';
import { Transaction } from '../src/domain/transaction.entity.js';

test('TransactionRepository: должен генерировать SQL для сохранения транзакции', () => {
  const qb = new QueryBuilder();
  const repo = new TransactionRepository(qb);
  const tx = new Transaction({
    walletId: 'uuid-1',
    amount: 500,
    type: 'DEPOSIT'
  });

  const { sql, params } = repo.save(tx, 'COMPLETED');

  assert.strictEqual(sql, 'INSERT INTO transactions (wallet_id, amount, type, status) VALUES ($1, $2, $3, $4);')

});
