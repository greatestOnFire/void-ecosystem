import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QueryBuilder } from '@void/core-query-builder';
import { TransactionRepository } from '../src/infrastructure/transaction.repository.js';
import { Transaction } from '../src/domain/transaction.entity.js';

test('TransactionRepository: должен генерировать корректный SQL с reference_id при передаче третьего аргумента', () => {
  const mockCreateQb = () => new QueryBuilder();
  const repo = new TransactionRepository(mockCreateQb);
  const tx = new Transaction({
    walletId: 'uuid-1',
    amount: 500,
    type: 'TRANSFER'
  });
  
  // Передаем статус и сквозной referenceId оригинального заказа Саги
  const { sql, params } = repo.save(tx, 'COMPLETED', 'order-uuid-777');
  
  assert.strictEqual(
      sql,
      'INSERT INTO transactions (wallet_id, amount, type, status, reference_id) VALUES ($1, $2, $3, $4, $5);'
  );
  assert.deepStrictEqual(params, ['uuid-1', 500, 'TRANSFER', 'COMPLETED', 'order-uuid-777']);
});
