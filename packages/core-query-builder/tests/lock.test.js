import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QueryBuilder } from '../src/index.js';

test('QueryBuilder: должен генерировать SELECT с FOR UPDATE для ACID транзакций', () => {
  const qb = new QueryBuilder();

  const { sql, params } = qb
    .from('wallets')
    .where('user_id', 1)
    .forUpdate()
    .build();

  assert.strictEqual(sql, 'SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE;');
  assert.deepStrictEqual(params, [1]);
});
