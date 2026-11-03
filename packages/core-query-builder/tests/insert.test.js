import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QueryBuilder } from '../src/index.js';

test('QueryBuilder: должен генерировать корректный INSERT', () => {
  const qb = new QueryBuilder();
  const data = { email: 'test@void.com', role: 'admin' };

  const result = qb.insertInto('users', data).build();

  assert.strictEqual(result.sql, 'INSERT INTO users (email, role) VALUES ($1, $2);');
  assert.deepStrictEqual(result.params, ['test@void.com', 'admin']);
});


test('QueryBuilder: должен выбрасывать ошибку при пустом объекте данных для INSERT', () => {
  const qb = new QueryBuilder();

  assert.throws(() => {
    qb.insertInto('users', {}).build();
  }, {
    message: 'Insert data cannot be empty'
  });
});

test('QueryBuilder: должен нативно генерировать INSERT с опциональным reference_id для финтех-транзакций', () => {
  const qb = new QueryBuilder();
  const data = {
    wallet_id: 'uuid-wallet-123',
    amount: 500,
    type: 'TRANSFER',
    status: 'COMPLETED',
    reference_id: 'uuid-saga-order-777' // Наше опциональное поле связи микросервисов
  };
  
  const result = qb.insertInto('transactions', data).build();
  
  // Мы ожидаем строгую параметризацию пяти колонок СУБД по Клепманну
  assert.strictEqual(
      result.sql,
      'INSERT INTO transactions (wallet_id, amount, type, status, reference_id) VALUES ($1, $2, $3, $4, $5);'
  );
  assert.deepStrictEqual(result.params, ['uuid-wallet-123', 500, 'TRANSFER', 'COMPLETED', 'uuid-saga-order-777']);
});
