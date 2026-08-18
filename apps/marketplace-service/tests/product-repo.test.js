import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QueryBuilder } from '@void/core-query-builder';
import { ProductRepository } from '../src/infrastructure/product.repository.js';

test('ProductRepository: должен выполнять SQL-запрос для получения всех товаров', async () => {
	const mockCreateQb = () => new QueryBuilder();
	
	// Имитируем драйвер pg СУБД
	let executedSql = '';
	let executedParams = null;
	const mockDb = {
		query: async (sql, params) => {
			executedSql = sql;
			executedParams = params;
			return { rows: [{ id: 'p1', title: 'Товар', price: 100, stock: 5 }] };
		}
	};
	
	const repo = new ProductRepository(mockCreateQb, mockDb);
	const products = await repo.findAll();
	
	assert.strictEqual(executedSql, 'SELECT * FROM products;');
	assert.deepStrictEqual(executedParams, []);
	assert.strictEqual(products.length, 1);
});

test('ProductRepository: должен корректно генерировать SQL для поиска товара по ID', async () => {
	const mockCreateQb = () => new QueryBuilder();
	
	let executedSql = '';
	let executedParams = null;
	const mockDb = {
		query: async (sql, params) => {
			executedSql = sql;
			executedParams = params;
			return { rows: [{ id: '8ca5c4eb-73fa-4df6-880c-7b44747eb224', title: 'Смартфон', price: 500000, stock: 2 }] };
		}
	};
	
	const repo = new ProductRepository(mockCreateQb, mockDb);
	const targetId = '8ca5c4eb-73fa-4df6-880c-7b44747eb224';
	const product = await repo.findById(targetId);
	
	// Проверяем строгий контракт параметризации СУБД по Клепманну
	assert.strictEqual(executedSql, 'SELECT * FROM products WHERE id = $1;');
	assert.deepStrictEqual(executedParams, [targetId]);
	assert.strictEqual(product.id, targetId);
});

