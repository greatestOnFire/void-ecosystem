import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QueryBuilder } from '@void/core-query-builder';
import { OrderRepository } from '../src/infrastructure/order.repository.js'; // Этого файла еще нет

test('OrderRepository: должен корректно генерировать SQL INSERT контракт для сохранения заказа', () => {
	const mockCreateQb = () => new QueryBuilder();
	const repo = new OrderRepository(mockCreateQb);
	
	const orderData = {
		id: 'd3b07384-d113-4c4e-9c8e-cfbfbfbe9713',
		userId: 42,
		productId: '8ca5c4eb-73fa-4df6-880c-7b44747eb224',
		quantity: 1,
		status: 'PENDING'
	};
	
	const { sql, params } = repo.save(orderData);
	
	// Проверяем, что репозиторий мапит camelCase полей в snake_case колонок БД СУБД
	assert.strictEqual(
			sql,
			'INSERT INTO orders (id, user_id, product_id, quantity, status) VALUES ($1, $2, $3, $4, $5);'
	);
	assert.deepStrictEqual(params, [
		'd3b07384-d113-4c4e-9c8e-cfbfbfbe9713',
		42,
		'8ca5c4eb-73fa-4df6-880c-7b44747eb224',
		1,
		'PENDING'
	]);
});
