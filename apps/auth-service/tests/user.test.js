import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QueryBuilder } from '@void/core-query-builder';

import { User } from '../src/domain/user.entity.js';
import { UserRepository } from '../src/infrastructure/user.repository.js';


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

test('User Entity: должен выбрасывать ошибку при невалидном email', () => {
  assert.throws(() => {
    new User({ email: 'invalid-email', passwordHash: 'hash' });
  }, {
    message: 'Invalid email format'
  });
});

test('User Entity: должен успешно создавать объект пользователя', () => {
  const data = { email: 'test@void.com', passwordHash: 'hash123' };
  const user = new User(data);

  assert.strictEqual(user.email, data.email);
  assert.strictEqual(user.passwordHash, data.passwordHash);
});

test('UserRepository: должен корректно сохранять сущность User', () => {
  const qb = new QueryBuilder();
  const repo = new UserRepository(qb);
  const user = new User({ email: 'repo@void.com', passwordHash: 'secret' });

  const { sql, params } = repo.save(user);

  assert.strictEqual(sql, 'INSERT INTO users (email, password_hash) VALUES ($1, $2);');
  assert.deepStrictEqual(params, ['repo@void.com', 'secret']);
});
