import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CreateOrder } from '../src/use-cases/create-order.js';

test('CreateOrder Use Case: должен выбрасывать ошибку, если товар не найден', async () => {
	// Мокаем репозиторий товаров: имитируем, что товар с любым ID отсутствует
	const mockProductRepo = {
		findById: async () => null
	};
	
	const mockOrderRepo = {
		save: () => ({ sql: 'INSERT...', params: [] })
	};
	
	const mockDb = {
		getTransactionClient: async () => ({
			query: async () => {},
			release: () => {}
		})
	};
	
	const useCase = new CreateOrder({
		productRepo: mockProductRepo,
		orderRepo: mockOrderRepo,
		db: mockDb
	});
	
	// Проверяем, что сценарий выбрасывает строго определенное доменное исключение
	await assert.rejects(
			async () => {
				await useCase.execute({
					userId: 42,
					productId: 'non-existent-uuid',
					quantity: 1
				});
			},
			{ message: 'Product not found' }
	);
});

test('CreateOrder Use Case: должен выбрасывать ошибку, если товара на складе недостаточно', async () => {
	// Имитируем, что товар найден, но на складе осталось всего 2 штуки
	const mockProductRepo = {
		findById: async (id) => ({
			id,
			title: 'Игровой монитор ASUS',
			price: 180000,
			stock: 2
		})
	};
	
	const mockOrderRepo = {
		save: () => ({ sql: 'INSERT...', params: [] })
	};
	
	const mockDb = {
		getTransactionClient: async () => ({
			query: async () => {},
			release: () => {}
		})
	};
	
	const useCase = new CreateOrder({
		productRepo: mockProductRepo,
		orderRepo: mockOrderRepo,
		db: mockDb
	});
	
	// Пользователь запрашивает 5 штук при остатке 2 — контракт должен упасть с ошибкой
	await assert.rejects(
			async () => {
				await useCase.execute({
					userId: 42,
					productId: 'prod-monitor',
					quantity: 5
				});
			},
			{ message: 'Insufficient stock' }
	);
});

test('CreateOrder Use Case: должен успешно открыть транзакцию, записать заказ в БД и опубликовать правильный orderId и idempotencyKey в Сагу', async () => {
	const targetProductId = 'prod-laptop-123';
	const mockProductRepo = {
		findById: async (id) => ({ id, title: 'Ноутбук', price: 400000, stock: 10 })
	};
	
	const mockOrderRepo = {
		save: (order) => ({ sql: 'INSERT INTO orders (id) VALUES ($1);', params: [order.id] })
	};
	
	const mockClient = {
		query: async () => {},
		release: () => {}
	};
	
	const mockDb = {
		getTransactionClient: async () => mockClient
	};
	
	let publishedChannel = null;
	let publishedEvent = null;
	const mockEventBus = {
		publish: async (channel, event) => {
			publishedChannel = channel;
			publishedEvent = event;
			return 1;
		}
	};
	
	const useCase = new CreateOrder({
		productRepo: mockProductRepo,
		orderRepo: mockOrderRepo,
		db: mockDb,
		eventBus: mockEventBus
	});
	
	const result = await useCase.execute({
		userId: 77,
		productId: targetProductId,
		quantity: 1
	});
	
	assert.strictEqual(result.success, true);
	assert.ok(result.orderId);
	
	// --- ПРОВЕРКА СКВОЗНОГО КОНТЕКСТА САГИ И ИДЕМПОТЕНТНОСТИ ---
	assert.strictEqual(publishedChannel, 'payment-commands');
	assert.strictEqual(publishedEvent.type, 'PROCESS_TRANSFER');
	assert.strictEqual(publishedEvent.payload.originalReferenceId, result.orderId);
	
	// 🔥 ЭТОТ АССЕРТ УПАДЕТ (RED): Проверяем, что маркетплейс генерирует финтех-ключ защиты от дублей
	assert.ok(publishedEvent.payload.idempotencyKey, 'Сага-команда обязана содержать idempotencyKey');
	assert.strictEqual(typeof publishedEvent.payload.idempotencyKey, 'string');
});
