
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { MarketplaceApiClient } from '../src/application/api.client.js';

test('Marketplace API Client: должен успешно запрашивать товары и мапить их на домен', async () => {
	// Имитируем ответ сервера (Mock)
	const mockProductsResponse = [
		{ id: 'p-100', title: 'Клавиатура Razer', price: 45000, stock: 8 }
	];
	
	// Перехватываем глобальный fetch
	const originalFetch = global.fetch;
	global.fetch = async (url) => {
		assert.ok(url.includes('/api/products'));
		return {
			ok: true,
			json: async () => mockProductsResponse
		};
	};
	
	const apiClient = new MarketplaceApiClient('http://localhost:3002');
	const products = await apiClient.getProducts();
	
	assert.strictEqual(products.length, 1);
	assert.strictEqual(products[0].id, 'p-100');
	assert.strictEqual(products[0].price, 45000);
	
	// Проверяем, что это именно инстанс нашей доменной сущности с инвариантами
	assert.strictEqual(products[0].constructor.name, 'Product');
	
	// Восстанавливаем оригинальный fetch
	global.fetch = originalFetch;
});
