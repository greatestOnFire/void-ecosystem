import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Product } from '../src/domain/product.entity.js';
import { useCartStore } from '../src/application/cart.store.js';

test('Zustand Cart Store: должен управлять состоянием корзины и реагировать на экшены', () => {
	// Перед тестом сбрасываем состояние стора (полезно при перезапусках)
	useCartStore.setState({ items: [], totalPrice: 0 });
	
	const tv = new Product({ id: 'prod-tv', title: 'Телевизор LG', price: 300000, stock: 3 });
	
	// 1. Проверяем начальное состояние
	let state = useCartStore.getState();
	assert.strictEqual(state.items.length, 0);
	assert.strictEqual(state.totalPrice, 0);
	
	// 2. Вызываем экшен добавления товара
	state.addItem(tv, 2);
	
	// 3. Проверяем, что стейт обновился
	const updatedState = useCartStore.getState();
	assert.strictEqual(updatedState.items.length, 1);
	assert.strictEqual(updatedState.items[0].quantity, 2);
	assert.strictEqual(updatedState.totalPrice, 600000);
});
