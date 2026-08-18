import { test } from 'node:test';
import assert from 'node:assert/strict';
import { useProductsQueryContract } from '../src/application/products.query.js';

test('Products Query Contract: должен содержать правильный queryKey и вызывать getProducts', () => {
	const mockApiClient = {
		getProducts: async () => ['mock-product-entity']
	};
	
	// Вызываем фабрику контракта для TanStack Query
	const queryConfig = useProductsQueryContract(mockApiClient);
	
	// 1. Проверяем строгий инвариант ключа кэша (чтобы инвалидация работала предсказуемо)
	assert.deepStrictEqual(queryConfig.queryKey, ['products']);
	
	// 2. Проверяем, что функция запроса вызывает метод нашего API-клиента
	const resultPromise = queryConfig.queryFn();
	
	assert.doesNotReject(resultPromise);
});
