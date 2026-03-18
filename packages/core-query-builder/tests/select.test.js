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

test('QueryBuilder: должен генерировать WHERE с параметрами', () => {
  const qb = new QueryBuilder();
  const result = qb
    .select('email')
    .from('users')
    .where('id', 1)
    .build();

  // Мы ожидаем объект, содержащий SQL и массив значений
  assert.strictEqual(result.sql, 'SELECT email FROM users WHERE id = $1;');
  assert.deepStrictEqual(result.params, [1]);
});
