import { test } from 'node:test';
import assert from 'node:assert/strict';
import { useCartStore } from '../src/application/cart.store.js';

test('Cart Store Integration: UI handler emulation triggers correct bff request', async () => {
	let fetchedUrl = '';
	let fetchedOptions = null;
	const originalFetch = global.fetch;
	
	global.fetch = async (url, options) => {
		fetchedUrl = url;
		fetchedOptions = options;
		return {
			status: 201,
			ok: true,
			json: async () => ({ success: true, orderId: 'order-123' })
		};
	};
	
	useCartStore.setState({
		items: [{ product: { id: 'prod-tv', title: 'Телевизор', price: 300000 }, quantity: 1 }],
		totalPrice: 300000
	});
	
	const store = useCartStore.getState();
	const firstItem = store.items[0];
	const result = await store.checkout({
		userId: 42,
		productId: firstItem.product.id,
		quantity: firstItem.quantity
	});
	
	assert.strictEqual(fetchedUrl, '/api/bff/orders');
	assert.strictEqual(fetchedOptions.method, 'POST');
	assert.strictEqual(result.success, true);
	
	global.fetch = originalFetch;
});
