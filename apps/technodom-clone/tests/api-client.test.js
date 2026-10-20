
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
		assert.ok(url.includes('/api/bff/products'));
		return {
			ok: true,
			json: async () => mockProductsResponse
		};
	};
	
	const apiClient = new MarketplaceApiClient('');
	const products = await apiClient.getProducts();
	
	assert.strictEqual(products.length, 1);
	assert.strictEqual(products[0].id, 'p-100');
	assert.strictEqual(products[0].price, 45000);
	
	// Проверяем, что это именно инстанс нашей доменной сущности с инвариантами
	assert.strictEqual(products[0].constructor.name, 'Product');
	
	// Восстанавливаем оригинальный fetch
	global.fetch = originalFetch;
});


test('Marketplace API Client: должен успешно запрашивать один товар по ID и мапить на доменную сущность', async () => {
	const targetId = 'prod-tv-777';
	const mockProductResponse = { id: targetId, title: 'Телевизор Sony', price: 400000, stock: 5 };
	
	const originalFetch = global.fetch;
	let fetchedUrl = '';
	
	global.fetch = async (url) => {
		fetchedUrl = url;
		return {
			ok: true,
			json: async () => mockProductResponse
		};
	};
	
	const apiClient = new MarketplaceApiClient('');
	const product = await apiClient.getProductById(targetId);
	
	assert.strictEqual(fetchedUrl, `/api/bff/products/${targetId}`);
	assert.strictEqual(product.id, targetId);
	assert.strictEqual(product.title, 'Телевизор Sony');
	assert.strictEqual(product.constructor.name, 'Product');
	
	global.fetch = originalFetch;
});
