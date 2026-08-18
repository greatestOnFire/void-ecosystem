import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QueryBuilder } from '@void/core-query-builder';
import { ProductRepository } from '../src/infrastructure/product.repository.js';

test('ProductRepository: должен корректно генерировать SQL для получения списка товаров', () => {
	// Фабрика для инъекции зависимостей (Thread-Safety Ready)
	const mockCreateQb = () => new QueryBuilder();
	
	const repo = new ProductRepository(mockCreateQb);
	const result = repo.findAll();
	
	// Проверяем структуру возвращаемого контракта
	assert.strictEqual(result.sql, 'SELECT * FROM products;');
	assert.deepStrictEqual(result.params, []);
});
