import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Product } from '../src/domain/product.entity.js';
import { Cart } from '../src/domain/cart.domain.js';

test('Cart: должен корректно добавлять товары и рассчитывать total цену', () => {
	const cart = new Cart();
	
	const phone = new Product({ id: 'p1', title: 'iPhone 15', price: 500000, stock: 5 });
	const caseItem = new Product({ id: 'p2', title: 'Чехол', price: 10000, stock: 10 });
	
	cart.addItem(phone, 1);
	cart.addItem(caseItem, 2); // 500000 * 1 + 10000 * 2 = 520000
	
	assert.strictEqual(cart.items.length, 2);
	assert.strictEqual(cart.totalPrice, 520000);
});

test('Cart Domain: должен увеличивать количество (quantity), если добавляется уже существующий в корзине товар', () => {
	const cart = new Cart();
	const phone = new Product({ id: 'p-1', title: 'iPhone 15', price: 500000, stock: 5 });
	
	cart.addItem(phone, 1);
	cart.addItem(phone, 2); // Повторное добавление того же инстанса
	
	assert.strictEqual(cart.items.length, 1); // Массив не должен вырасти!
	assert.strictEqual(cart.items[0].quantity, 3); // Количество должно просуммироваться
});

