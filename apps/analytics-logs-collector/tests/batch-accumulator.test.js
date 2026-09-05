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
});
