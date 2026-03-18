import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QueryBuilder } from '../src/index.js';

test('QueryBuilder: должен генерировать UPDATE с параметрами и WHERE', () => {
  const qb = new QueryBuilder();
  const data = { role: 'editor', status: 'active' };

  const result = qb
    .update('users', data)
    .where('id', 10)
    .build();

  assert.strictEqual(result.sql, 'UPDATE users SET role = $1, status = $2 WHERE id = $3;');
  assert.deepStrictEqual(result.params, ['editor', 'active', 10]);
});
