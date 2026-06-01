import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TransferFunds } from '../src/use-cases/transfer-funds.js';

test('Saga Integration: TransferFunds должен публиковать событие после успешного коммита', async () => {
  let publishedChannel = null;
  let publishedEvent = null;

  // Мокаем EventBus
  const mockEventBus = {
    publish: async (channel, event) => {
      publishedChannel = channel;
      publishedEvent = event;
      return 1;
    }
  };

  const mockWalletRepo = {
    findByIdForUpdate: async (id) => ({ id, balance: '1000.00' }),
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
    eventBus: mockEventBus // Внедряем шину событий
  });

  await useCase.execute({
    fromWalletId: 's1',
    toWalletId: 'r1',
    amount: 100
  });

  assert.strictEqual(publishedChannel, 'payment-events');
});
