import { test } from 'node:test';
import assert from 'node:assert/strict';

test('Next.js BFF Route: POST /api/bff/orders должен успешно проксировать запрос в бизнес-микросервис', async () => {
	// Имитируем, что микросервис маркетплейса ответил успехом (Mock)
	const mockMarketplaceResponse = { success: true, orderId: 'generated-order-uuid-111' };
	
	// Перехватываем глобальный fetch на сервере BFF
	const originalFetch = global.fetch;
	let fetchedUrl = '';
	let fetchedOptions = null;
	
	global.fetch = async (url, options) => {
		fetchedUrl = url;
		fetchedOptions = options;
		return {
			status: 201,
			ok: true,
			json: async () => mockMarketplaceResponse
		};
	};
	
	// Имитируем вызов нашего BFF обработчика (Next.js API Route Handler)
	// Мы импортируем его напрямую, как чистую Node.js функцию
	const { POST } = await import('../src/app/api/bff/orders/route.js');
	
	// Создаем фейковый объект входящего запроса Next.js (Request)
	const mockRequestBody = { userId: 42, productId: 'prod-123', quantity: 2 };
	const mockRequest = new Request('http://localhost:3000/api/bff/orders', {
		method: 'POST',
		body: JSON.stringify(mockRequestBody),
		headers: { 'Content-Type': 'application/json' }
	});
	
	const response = await POST(mockRequest);
	const responseData = await response.json();
	
	// --- ПРОВЕРКА ИНВАРИАНТОВ BFF ---
	// Проверяем, что BFF постучался именно во внутреннюю сеть к ядру на порт 3002
	assert.strictEqual(fetchedUrl, 'http://localhost:3002/api/orders');
	assert.strictEqual(fetchedOptions.method, 'POST');
	
	// Проверяем, что BFF вернул фронтенду валидный ответ
	assert.strictEqual(response.status, 201);
	assert.strictEqual(responseData.orderId, 'generated-order-uuid-111');
	
	// Восстанавливаем fetch
	global.fetch = originalFetch;
});
