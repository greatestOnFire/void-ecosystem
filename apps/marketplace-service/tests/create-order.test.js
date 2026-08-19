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

