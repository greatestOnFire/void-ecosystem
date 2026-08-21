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

test('CreateOrder Use Case: должен успешно открыть транзакцию и записать заказ в БД', async () => {
	// 1. Имитируем, что товар успешно найден и на складе его достаточно
	const mockProductRepo = {
		findById: async (id) => ({ id, title: 'Ноутбук', price: 400000, stock: 10 })
	};
	
	// 2. Имитируем, что репозиторий заказов генерирует правильный SQL контракт
	let saveCalledWith = null;
	const mockOrderRepo = {
		save: (order) => {
			saveCalledWith = order;
			return { sql: 'INSERT INTO orders (id) VALUES ($1);', params: [order.id] };
		}
	};
	
	// 3. Имитируем транзакционного клиента СУБД для проверки вызовов BEGIN/COMMIT
	const executedQueries = [];
	const mockClient = {
		query: async (sql, params) => {
			executedQueries.push(sql);
		},
		release: () => {}
	};
	
	const mockDb = {
		getTransactionClient: async () => mockClient
	};
	
	const useCase = new CreateOrder({
		productRepo: mockProductRepo,
		orderRepo: mockOrderRepo,
		db: mockDb
	});
	
	const result = await useCase.execute({
		userId: 77,
		productId: 'prod-laptop',
		quantity: 1
	});
	
	// Проверяем финтех-инварианты выполнения:
	assert.strictEqual(result.success, true);
	assert.ok(result.orderId); // ID заказа должен быть сгенерирован (UUID)
	
	// Проверяем строгое соблюдение ACID границ в СУБД
	assert.strictEqual(executedQueries[0], 'BEGIN');
	assert.strictEqual(executedQueries[1], 'INSERT INTO orders (id) VALUES ($1);');
	assert.strictEqual(executedQueries[2], 'COMMIT');
	
	// Проверяем, что в репозиторий улетел правильный статус
	assert.strictEqual(saveCalledWith.status, 'PENDING');
});

