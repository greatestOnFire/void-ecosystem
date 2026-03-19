import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QueryBuilder } from '@void/core-query-builder';

test('Auth Service: должен генерировать SQL для создания нового пользователя', () => {
  const qb = new QueryBuilder();
  const userData = {
    email: 'engineer@void.com',
    password_hash: 'hashed_secret'
  };

  const { sql, params } = qb.insertInto('users', userData).build();

  assert.strictEqual(sql, 'INSERT INTO users (email, password_hash) VALUES ($1, $2);');
  assert.deepStrictEqual(params, ['engineer@void.com', 'hashed_secret']);
});
