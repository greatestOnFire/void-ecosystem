import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { router } from '../src/router.js';

function createMockRes() {
	return {
		statusCode: 0,
		headers: {},
		body: '',
		writeHead(code, headers) {
			this.statusCode = code;
			this.headers = headers;
		},
		end(data) { this.body = data; }
	};
}

test('Marketplace Router: должен возвращать 200 и статус ok на маршруте /health', async () => {
	const req = { method: 'GET', url: '/health' };
	const res = createMockRes();
	const mockContext = { productRepo: {} };
	
	await router(req, res, mockContext);
	
	assert.strictEqual(res.statusCode, 200);
	assert.strictEqual(JSON.parse(res.body).status, 'ok');
});

test('Marketplace Router: должен вызывать productRepo.findAll на маршруте /api/products', async () => {
	const req = { method: 'GET', url: '/api/products' };
	const res = createMockRes();
	
	let findAllCalled = false;
	const mockContext = {
		productRepo: {
			findAll: async () => {
				findAllCalled = true;
				return [{ id: 'p1', title: 'Товар', price: 100 }];
			}
		}
	};
	
	await router(req, res, mockContext);
	
	assert.strictEqual(res.statusCode, 200);
	assert.strictEqual(findAllCalled, true);
	assert.strictEqual(JSON.parse(res.body)[0].title, 'Товар');
});
