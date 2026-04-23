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
