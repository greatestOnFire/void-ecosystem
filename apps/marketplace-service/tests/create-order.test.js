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
