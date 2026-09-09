import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { BatchLogAccumulator } from '../src/infrastructure/batch-accumulator.js';
import { AnalyticsEventWorker } from '../src/infrastructure/analytics-worker.js';

test('Интеграция Логгера: должен принимать события из Redis Pub/Sub и сбрасывать их в ClickHouse пачкой по лимиту', async () => {
	const flushedBatches = [];
	
	const mockRedisSub = new EventEmitter();
	mockRedisSub.subscribe = async () => {};
	
	// Перехватываем то, что улетает в ClickHouse
	const mockClickHouse = {
		insert: async ({ table, values, format }) => {
			flushedBatches.push({ table, values, format });
		}
	};
	
	// Выставляем лимит пачки = 2
	const accumulator = new BatchLogAccumulator({
		clickhouse: mockClickHouse,
		batchLimit: 2
	});
	
	const worker = new AnalyticsEventWorker({
		redisSub: mockRedisSub,
		accumulator: accumulator
	});
	
	await worker.start();
	
	// 1. Имитируем первое событие от платежного шлюза (1/2)
	mockRedisSub.emit('message', 'payment-events', JSON.stringify({
		type: 'TRANSFER_COMPLETED',
		payload: { fromWalletId: 'w1', toWalletId: 'w2', amount: 15000 }
	}));
	
	// В эту миллисекунду батч еще не сброшен, так как лимит не достигнут
	assert.strictEqual(flushedBatches.length, 0);
	
	// 2. Имитируем второе событие от маркетплейса — триггер лимита (2/2)
	mockRedisSub.emit('message', 'payment-events', JSON.stringify({
		type: 'CANCEL_TRANSFER',
		payload: { originalReferenceId: 'order-123' }
	}));
	
	// Даем асинхронному Event Loop выполнить микрозадачи
	await new Promise(setImmediate);
	
	// Проверяем сквозной инвариант: пачка из 2 элементов атомарно улетела в ClickHouse!
	assert.strictEqual(flushedBatches.length, 1);
	assert.strictEqual(flushedBatches[0].table, 'saga_analytics_logs');
	assert.strictEqual(flushedBatches[0].values.length, 2);
	
	// Проверяем обогащение первого лога временем и структурой
	const firstLog = flushedBatches[0].values[0];
	assert.strictEqual(firstLog.type, 'TRANSFER_COMPLETED');
	assert.strictEqual(firstLog.payload.amount, 15000);
	assert.ok(firstLog.timestamp); // Метка времени проставлена воркером бэкенда!
	
	// Проверяем второй лог в пачке
	const secondLog = flushedBatches[0].values[1];
	assert.strictEqual(secondLog.type, 'CANCEL_TRANSFER');
	
	// Освобождаем Event Loop от фоновых интервалов аккумулятора
	accumulator.destroy();
});
