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

test('ProductRepository: должен корректно генерировать SQL для поиска товара по ID', () => {
	const mockCreateQb = () => new QueryBuilder();
	const repo = new ProductRepository(mockCreateQb);
	
	const targetId = '8ca5c4eb-73fa-4df6-880c-7b44747eb224';
	const result = repo.findById(targetId);
	
	// Проверяем строгий контракт параметризации СУБД по Клепманну
	assert.strictEqual(result.sql, 'SELECT * FROM products WHERE id = $1;');
	assert.deepStrictEqual(result.params, [targetId]);
});

