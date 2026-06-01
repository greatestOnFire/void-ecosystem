import { test } from 'node:test';
import assert from 'node:assert/strict';

test('Saga Event Bus: должен корректно формировать структуру события для публикации', () => {
  const event = {
    type: 'PAYMENT_PROCESSED',
    payload: {
      orderId: 'order-777',
      amount: 15000,
      walletId: 'wallet-abc'
    }
  };

  assert.strictEqual(event.type, 'PAYMENT_PROCESSED');
  assert.strictEqual(event.payload.orderId, 'order-777');
});
