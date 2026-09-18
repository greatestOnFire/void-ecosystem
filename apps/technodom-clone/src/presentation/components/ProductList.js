'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useProductsQueryContract } from '../../application/products.query.js';
import { ProductCard } from './ProductCard.js';

/**
 * @typedef {Object} ProductListProps
 * @property {import('../../application/api.client.js').MarketplaceApiClient} apiClient - Экземпляр сетевого API-клиента
 */

/**
 * UI-компонент сетки каталога товаров.
 * Оркеструет серверный стейт TanStack Query и рендеринг карточек.
 * Слой: Presentation (Client Component)
 *
 * @param {ProductListProps} props
 * @returns {React.JSX.Element}
 */
export function ProductList({ apiClient }) {
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
