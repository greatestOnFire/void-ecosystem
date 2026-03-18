import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QueryBuilder } from '../src/index.js';

test('QueryBuilder: должен генерировать DELETE с WHERE', () => {
  const qb = new QueryBuilder();
  const result = qb
    .deleteFrom('users')
    .where('id', 1)
    .build();

  assert.strictEqual(result.sql, 'DELETE FROM users WHERE id = $1;');
  assert.deepStrictEqual(result.params, [1]);
});
