import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QueryBuilder } from '@void/core-query-builder';
import { WalletRepository } from '../src/infrastructure/wallet.repository.js';
import { Wallet } from '../src/domain/wallet.entity.js';

test('WalletRepository: должен генерировать корректный SQL для сохранения кошелька', () => {
  const qb = new QueryBuilder();
  const repo = new WalletRepository(qb);
  const wallet = new Wallet({ userId: 42, balance: 1000 });

  const { sql, params } = repo.save(wallet);

  // Проверяем маппинг на таблицу wallets и snake_case колонки
  assert.strictEqual(sql, 'INSERT INTO wallets (user_id, balance) VALUES ($1, $2);');
  assert.deepStrictEqual(params, [42, 1000]);
});
