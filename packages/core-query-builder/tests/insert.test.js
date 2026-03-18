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
