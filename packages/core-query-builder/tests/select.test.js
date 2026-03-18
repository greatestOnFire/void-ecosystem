import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QueryBuilder } from '../src/index.js';

test('QueryBuilder: должен генерировать базовый SELECT *', () => {
  const qb = new QueryBuilder();
  const query = qb.from('users').build();

  assert.equal(qb.from('users').build().sql, 'SELECT * FROM users;');
});

test('QueryBuilder: должен выбирать конкретные колонки', () => {
  const qb = new QueryBuilder();
  const query = qb.select('id', 'name').from('users').build();

  assert.equal(qb.from('users').build().sql, 'SELECT id, name FROM users;');
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


test('QueryBuilder: должен объединять несколько условий через AND', () => {
  const qb = new QueryBuilder();
  const result = qb
    .from('users')
    .where('status', 'active')
    .where('role', 'admin')
    .build();

  assert.strictEqual(result.sql, 'SELECT * FROM users WHERE status = $1 AND role = $2;');
  assert.deepStrictEqual(result.params, ['active', 'admin']);
});
