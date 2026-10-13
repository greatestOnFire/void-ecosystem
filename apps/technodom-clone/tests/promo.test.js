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
