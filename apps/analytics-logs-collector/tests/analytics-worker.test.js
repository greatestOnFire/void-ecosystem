import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { AnalyticsEventWorker } from '../src/infrastructure/analytics-worker.js';

test('AnalyticsEventWorker: должен подписаться на канал payment-events и перенаправлять логи в аккумулятор', async () => {
	const mockRedisSub = new EventEmitter();
	mockRedisSub.subscribe = async () => {};
	
	// Мокаем наш пакетный аккумулятор
	const pushedLogs = [];
	const mockAccumulator = {
		push: async (log) => {
			pushedLogs.push(log);
		}
	};
	
	const worker = new AnalyticsEventWorker({
		redisSub: mockRedisSub,
		accumulator: mockAccumulator
	});
	
	await worker.start();
	
	// Имитируем, что платежный шлюз выбросил в Redis Pub/Sub событие успешного перевода
	const sampleEvent = {
		type: 'TRANSFER_COMPLETED',
		payload: { fromWalletId: 'w1', toWalletId: 'w2', amount: 15000 }
	};
	
	mockRedisSub.emit('message', 'payment-events', JSON.stringify(sampleEvent));
	
	// Даем макрозадачам Node.js выполниться
	await new Promise(setImmediate);
	
	// Проверяем инвариант: воркер поймал событие и успешно перенаправил в буфер ClickHouse
	assert.strictEqual(pushedLogs.length, 1);
	assert.strictEqual(pushedLogs[0].type, 'TRANSFER_COMPLETED');
	assert.strictEqual(pushedLogs[0].payload.amount, 15000);
	assert.ok(pushedLogs[0].timestamp); // Проверяем, что воркер автоматически обогатил лог временем
});
