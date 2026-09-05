import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BatchLogAccumulator } from '../src/infrastructure/batch-accumulator.js';

test('BatchLogAccumulator: должен копить логи в памяти и вызывать flush только при достижении лимита', async () => {
	const flushedBatches = [];
	
	// Имитируем клиент ClickHouse
	const mockClickHouse = {
		insert: async ({ table, values, format }) => {
			flushedBatches.push({ table, values, format });
		}
	};
	
	// Инициализируем аккумулятор с жестким лимитом пачки = 3
	const accumulator = new BatchLogAccumulator({
		clickhouse: mockClickHouse,
		batchLimit: 3
	});
	
	// 1. Пушим первый лог Саги
	await accumulator.push({ event: 'ORDER_CREATED', orderId: 'id-1' });
	assert.strictEqual(flushedBatches.length, 0); // Пачка еще не заполнена (1/3), в базу ничего не улетело!
	
	// 2. Пушим второй лог
	await accumulator.push({ event: 'PAYMENT_PROCESSED', orderId: 'id-1' });
	assert.strictEqual(flushedBatches.length, 0); // Все еще ждем (2/3)
	
	// 3. Пушим ТРЕТИЙ лог — триггер лимита!
	await accumulator.push({ event: 'SAGA_COMPLETED', orderId: 'id-1' });
	
	// Проверяем инвариант: пачка заполнилась (3/3), сработал автоматический сброс данных в СУБД
	assert.strictEqual(flushedBatches.length, 1);
	assert.strictEqual(flushedBatches[0].table, 'saga_analytics_logs');
	assert.strictEqual(flushedBatches[0].values.length, 3); // В СУБД улетела вся пачка из 3 элементов разом!
	
	// Очищаем таймер, чтобы Node.js завершил процесс теста без зависания
	accumulator.destroy();
});

test('BatchLogAccumulator: должен принудительно сбрасывать данные по таймеру, даже если лимит пачки не достигнут', async () => {
	const flushedBatches = [];
	const mockClickHouse = {
		insert: async ({ table, values, format }) => {
			flushedBatches.push({ table, values, format });
		}
	};
	
	// Инициализируем аккумулятор с лимитом 10 штук, но временем сброса 20 миллисекунд
	const accumulator = new BatchLogAccumulator({
		clickhouse: mockClickHouse,
		batchLimit: 10,
		flushIntervalMs: 20 // Новое свойство для конфигурации таймера
	});
	
	// Пушим всего 1 лог. Лимит (1/10) не достигнут!
	await accumulator.push({ event: 'NIGHT_LOG', orderId: 'id-unique' });
	assert.strictEqual(flushedBatches.length, 0); // В эту же миллисекунду в базе ничего нет
	
	// Ждем 50 миллисекунд (дольше, чем flushIntervalMs в 20мс)
	await new Promise((resolve) => setTimeout(resolve, 50));
	
	// Проверяем финтех-инвариант страховки: таймер сработал и вытолкнул ночной лог на диск!
	assert.strictEqual(flushedBatches.length, 1);
	assert.strictEqual(flushedBatches[0].values.length, 1);
	assert.strictEqual(flushedBatches[0].values[0].event, 'NIGHT_LOG');
	
	// Очищаем таймер, чтобы Node.js завершил процесс теста без зависания
	accumulator.destroy();
});

