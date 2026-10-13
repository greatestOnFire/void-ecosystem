'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MarketplaceApiClient } from '@/application/api.client.js';
import { useProductsQueryContract } from '@/application/products.query.js';
import { ProductCard } from './ProductCard.js';

/**
 * UI-компонент сетки каталога товаров.
 * Оркеструет серверный стейт TanStack Query и рендеринг карточек.
 * Слой: Presentation (Client Component)
 *
 * @returns {JSX.Element}
 */
export function ProductList() {
	// Инициализируем клиент один раз на стороне браузера (Client Side)
	const [apiClient] = useState(() => new MarketplaceApiClient(''));
	
	const { data: products, isLoading, isError, error } = useQuery(
			useProductsQueryContract(apiClient)
	);
	
	if (isLoading) {
		return <div className="product-list__loading">Загрузка каталога товаров...</div>;
	}
	
	if (isError) {
		return <div className="product-list__error">Ошибка загрузки: {error.message}</div>;
	}
	
	return (
			<section className="product-list">
				{products?.map((product) => (
						<ProductCard key={product.id} product={product} />
				))}
			</section>
	);
}
