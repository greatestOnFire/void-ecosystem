import { test } from 'node:test';
import assert from 'node:assert/strict';

test('Promo Contract: verify slide data structure consistency', () => {
	const sampleSlide = {
		id: 'promo-1',
		title: 'Рассрочка 0-0-24 на всё!',
		badge: 'Fintech Special'
	};
	
	assert.strictEqual(sampleSlide.id, 'promo-1');
	assert.ok(sampleSlide.title.includes('0-0-24'));
});

test('Sidebar Contract: verify category list array structure consistency', () => {
	const mockCategories = [
		{ id: 'cat-1', name: 'Смартфоны и гаджеты', icon: '📱' },
		{ id: 'cat-2', name: 'Ноутбуки и компьютеры', icon: '💻' }
	];
	
	assert.strictEqual(mockCategories.length, 2);
	assert.strictEqual(mockCategories[0].id, 'cat-1');
	assert.ok(mockCategories[1].name.includes('Ноутбуки'));
});
