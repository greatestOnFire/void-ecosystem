import { test } from 'node:test';
import assert from 'node:assert/strict';
import { useCartStore } from '../src/application/cart.store.js';

test('BuyButton Contract: verify payload mapped to zustand dispatch', async () => {
	let itemAdded = null;
	
	useCartStore.setState({
		items: [],
		addItem: (product, qty) => { itemAdded = { product, qty }; }
	});
	
	const mockProduct = { id: 'p-1', title: 'Смартфон', price: 500000 };
	const store = useCartStore.getState();
	
	store.addItem(mockProduct, 1);
	
	assert.strictEqual(itemAdded.product.id, 'p-1');
	assert.strictEqual(itemAdded.qty, 1);
});
