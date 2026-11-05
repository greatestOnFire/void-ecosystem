import { test } from 'node:test';
import assert from 'node:assert/strict';

test('Next.js BFF Route: POST /api/bff/auth/login должен успешно проксировать запрос в SSO службу', async () => {
	const mockAuthResponse = { accessToken: 'jwt-token-777', sessionId: 'session-xyz' };
	
	const originalFetch = global.fetch;
	let fetchedUrl = '';
	let fetchedOptions = null;
	
	global.fetch = async (url, options) => {
		fetchedUrl = url;
		fetchedOptions = options;
		return {
			status: 200,
			ok: true,
			json: async () => mockAuthResponse
		};
	};
	
	const { POST } = await import('../src/app/api/bff/auth/login/route.js');
	
	const mockRequestBody = { email: 'engineer@void.com', password: 'secure123' };
	const mockRequest = new Request('http://localhost:3000/api/bff/auth/login', {
		method: 'POST',
		body: JSON.stringify(mockRequestBody),
		headers: { 'Content-Type': 'application/json' }
	});
	
	const response = await POST(mockRequest);
	const responseData = await response.json();
	
	assert.strictEqual(fetchedUrl, 'http://localhost:3000/auth/login');
	assert.strictEqual(response.status, 200);
	assert.strictEqual(responseData.accessToken, 'jwt-token-777');
	
	global.fetch = originalFetch;
});


test('Next.js BFF Route: POST /api/bff/auth/register должен успешно проксировать создание аккаунта в SSO', async () => {
	const mockRegisterResponse = { message: 'User registered successfully' };
	
	const originalFetch = global.fetch;
	let fetchedUrl = '';
	let fetchedOptions = null;
	
	global.fetch = async (url, options) => {
		fetchedUrl = url;
		fetchedOptions = options;
		return {
			status: 201,
			ok: true,
			json: async () => mockRegisterResponse
		};
	};
	
	const { POST } = await import('../src/app/api/bff/auth/register/route.js');
	
	const mockRequestBody = { email: 'new-lead@void.com', password: 'password123' };
	const mockRequest = new Request('http://localhost:3000/api/bff/auth/register', {
		method: 'POST',
		body: JSON.stringify(mockRequestBody),
		headers: { 'Content-Type': 'application/json' }
	});
	
	const response = await POST(mockRequest);
	const responseData = await response.json();
	
	assert.strictEqual(fetchedUrl, 'http://localhost:3000/auth/register');
	assert.strictEqual(response.status, 201);
	assert.strictEqual(responseData.message, 'User registered successfully');
	
	global.fetch = originalFetch;
});
