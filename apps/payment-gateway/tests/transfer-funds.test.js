import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TransferFunds } from '../src/use-cases/transfer-funds.js';

test('TransferFunds Use Case: должен отклонить перевод при недостаточном балансе', async () => {
  // 1. Имитируем зависимости
  const mockWalletRepo = {
    // Мокаем поиск отправителя с балансом 100
    findByIdForUpdate: async (id) => {
      if (id === 'sender-1') return { id: 'sender-1', balance: '100.00' };
      if (id === 'receiver-1') return { id: 'receiver-1', balance: '0.00' };
      return null;
    }
  };

  const mockDb = {
    getTransactionClient: async () => ({
      query: async () => {},
      release: () => {}
    })
  };

  const useCase = new TransferFunds({
    walletRepo: mockWalletRepo,
    transactionRepo: {},
    db: mockDb
  });

  await assert.rejects(useCase.execute({
    fromWalletId: 'sender-1', toWalletId: 'receiver-1', amount: 500
  }), { message: 'Insufficient funds' });
});


test('TransferFunds Use Case: должен вызывать findByIdForUpdate в алфавитном порядке ID кошельков ' +
    'для предотвращения Deadlock', async () => {
  const callOrder = [];
  
  const mockWalletRepo = {
    findByIdForUpdate: async (id) => {
      callOrder.push(id);
      if (id === 'wallet-xyz') return { id: 'wallet-xyz', balance: '1000.00' };
      if (id === 'wallet-abc') return { id: 'wallet-abc', balance: '500.00' };
      return null;
    },
    updateBalance: () => ({ sql: 'UPDATE...', params: [] })
  };
  
  const mockDb = {
    getTransactionClient: async () => ({
      query: async () => {},
      release: () => {}
    })
  };
  
  const useCase = new TransferFunds({
    walletRepo: mockWalletRepo,
    transactionRepo: { save: () => ({ sql: 'INS...', params: [] }) },
    db: mockDb,
    redis: { get: async () => null, set: async () => {} },
    eventBus: { publish: async () => 1 }
  });
  
  // Отправитель - xyz (алфавитно больше), Получатель - abc (алфавитно меньше)
  await useCase.execute({
    fromWalletId: 'wallet-xyz',
    toWalletId: 'wallet-abc',
    amount: 100
  });
  
  // Тест упадет (RED), потому что сейчас callOrder будет ['wallet-xyz', 'wallet-abc']
  // А мы требуем строгий детерминированный порядок: сначала 'wallet-abc', затем 'wallet-xyz'
  assert.deepStrictEqual(callOrder, ['wallet-abc', 'wallet-xyz']);
});
