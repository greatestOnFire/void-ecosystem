import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DepositFunds } from '../src/use-cases/deposit-funds.js';

test('DepositFunds Use Case: должен подготовить SQL для пополнения', async () => {
  // 1. Мокаем репозиторий транзакций
  const mockTxRepo = {
    save: (tx, status) => ({
      sql: 'INSERT INTO transactions',
      params: []
    })
  };

  // 2. Мокаем репозиторий кошельков
  const mockWalletRepo = {
    findByIdForUpdate: async () => ({ id: 'w1', balance: '100.00' }),
    updateBalance: () => ({ sql: 'UPDATE wallets', params: [] })
  };

  // 3. ДОБАВЛЯЕМ МОК ДЛЯ БАЗЫ ДАННЫХ (Исправляет ошибку)
  const mockDb = {
    getTransactionClient: async () => ({
      query: async () => ({ rows: [] }), // имитируем успешные SQL запросы
      release: () => {}
    })
  };

  // Передаем все три зависимости в конструктор объектом
  const useCase = new DepositFunds({
    transactionRepo: mockTxRepo,
    walletRepo: mockWalletRepo,
    db: mockDb
  });

  const result = await useCase.execute({ walletId: 'w1', amount: 100 });

  assert.strictEqual(result.success, true);
});
