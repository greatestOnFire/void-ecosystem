import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { OrderSagaWorker } from '../src/infrastructure/order-saga-worker.js';

test('OrderSagaWorker: должен перехватить событие TRANSFER_COMPLETED и перевести заказ в статус PAID', async () => {
	const mockRedisSub = new EventEmitter();
	mockRedisSub.subscribe = async () => {};
	
	// Имитируем обновление статуса заказа в СУБД
	let updatedOrderId = null;
	let updatedStatus = null;
	
	const mockOrderRepo = {
		updateStatus: (id, status) => {
			updatedOrderId = id;
			updatedStatus = status;
			return { sql: 'UPDATE orders...', params: [status, id] };
		}
	};
	
	const mockDb = { query: async () => {} };
	
	const worker = new OrderSagaWorker({
		redisSub: mockRedisSub,
		orderRepo: mockOrderRepo,
		db: mockDb
	});
	
	await worker.start();
	
	// Имитируем событие успешной оплаты от платежного шлюза
	const eventPayload = {
		originalReferenceId: 'order-uuid-777', // ID нашего заказа
		amount: 5000
	};
	
	mockRedisSub.emit('message', 'payment-events', JSON.stringify({
		type: 'TRANSFER_COMPLETED',
		payload: eventPayload
	}));
	
	// Даем микрозадачам Node.js выполниться
	await new Promise(setImmediate);
	
	// Проверяем строгий инвариант Саги: статус обязан стать PAID
	assert.strictEqual(updatedOrderId, 'order-uuid-777');
	assert.strictEqual(updatedStatus, 'PAID');
});
