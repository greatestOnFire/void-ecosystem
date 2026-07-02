import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Product } from '../src/domain/product.entity.js';

test('Product Entity: должен успешно создаваться с валидными финтех-данными', () => {
	const product = new Product({
		id: 'prod-123',
		title: 'Смартфон Apple iPhone 15 Pro',
		price: 650000,
		stock: 14
	});
	
	assert.strictEqual(product.id, 'prod-123');
	assert.strictEqual(product.price, 650000);
});

test('Product Entity: должен выбрасывать ошибку, если цена отрицательная', () => {
	assert.throws(() => {
		new Product({
			id: 'prod-123',
			title: 'Кабель Type-C',
			price: -100,
			stock: 5
		});
	}, {
		message: 'Price cannot be negative'
	});
});

test('Product Entity: должен выбрасывать ошибку при пустом наименовании', () => {
	assert.throws(() => {
		new Product({
			id: 'prod-123',
			title: '   ',
			price: 5000,
			stock: 2
		});
	}, {
		message: 'Title cannot be empty'
	});
});
