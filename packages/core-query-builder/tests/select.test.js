import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QueryBuilder } from '../src/index.js';

test('QueryBuilder: должен генерировать базовый SELECT *', () => {
  const qb = new QueryBuilder();
  const query = qb.from('users').build();

  assert.equal(query, 'SELECT * FROM users;');
});

test('QueryBuilder: должен выбирать конкретные колонки', () => {
  const qb = new QueryBuilder();
  const query = qb.select('id', 'name').from('users').build();

  assert.equal(query, 'SELECT id, name FROM users;');
});
