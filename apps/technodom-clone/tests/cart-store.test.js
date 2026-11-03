import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { Product } from '../src/domain/product.entity.js';
import { useCartStore } from '../src/application/cart.store.js';

const storageMock = {};
globalThis.localStorage = {
	getItem: (key) => storageMock[key] || null,
	setItem: (key, value) => { storageMock[key] = String(value); },
	clear: () => { for (const key in storageMock) delete storageMock[key]; }
};

test('Zustand Cart Store: должен управлять состоянием корзины и реагировать на экшены', () => {
	// Перед тестом сбрасываем состояние стора (полезно при перезапусках)
	useCartStore.setState({ items: [], totalPrice: 0 });
	
	const tv = new Product({ id: 'prod-tv', title: 'Телевизор LG', price: 300000, stock: 3 });
	
	
	let state = useCartStore.getState();
	assert.strictEqual(state.items.length, 0);
	assert.strictEqual(state.totalPrice, 0);
	
	
	state.addItem(tv, 2);
	
	
	const updatedState = useCartStore.getState();
	assert.strictEqual(updatedState.items.length, 1);
	assert.strictEqual(updatedState.items[0].quantity, 2);
	assert.strictEqual(updatedState.totalPrice, 600000);
});


test('Zustand Cart Store: экшен checkout должен отправлять данные на BFF и возвращать успех', async () => {
	const originalFetch = global.fetch;
	let fetchedUrl = '';
	let fetchedOptions = null;
	
	global.fetch = async (url, options) => {
		fetchedUrl = url;
		fetchedOptions = options;
		return {
			status: 201,
			ok: true,
			json: async () => ({ success: true, orderId: 'order-uuid-999' })
		};
	};
	
	// Подготавливаем стейт стора (так как теперь checkout берет данные из get().items)
	useCartStore.setState({
		items: [{ product: { id: 'prod-abc', title: 'Тест', price: 1000 }, quantity: 1 }]
	});
	
	const store = useCartStore.getState();
	
	// Вызываем экшен БЕЗ аргументов — как в реальном UI!
	const result = await store.checkout();
	
	assert.strictEqual(fetchedUrl, '/api/bff/orders');
	assert.strictEqual(fetchedOptions.method, 'POST');
	assert.strictEqual(result.success, true);
	assert.strictEqual(result.orderId, 'order-uuid-999');
	assert.ok(result.userId, 'Должен возвращаться сгенерированный сессионный userId');
	
	global.fetch = originalFetch;
});

test('Zustand Cart Store: экшен clearCart должен полностью опустошать массив items и сбрасывать totalPrice', () => {
	const tv = { id: 'prod-tv', title: 'Телевизор', price: 300000 };
	
	useCartStore.setState({ items: [], totalPrice: 0 });
	
	const storeBefore = useCartStore.getState();
	storeBefore.addItem(tv, 1);
	
	const storeAfterAdd = useCartStore.getState();
	assert.strictEqual(storeAfterAdd.items.length, 1);
	
	storeAfterAdd.clearCart();
	
	const storeFinal = useCartStore.getState();
	assert.strictEqual(storeFinal.items.length, 0);
	assert.strictEqual(storeFinal.totalPrice, 0);
});

