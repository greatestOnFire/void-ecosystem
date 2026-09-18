'use client';

import React from 'react';
import { useCartStore } from '../../application/cart.store.js';
import { Product } from '../../domain/product.entity.js';

/**
 * @typedef {Object} ProductCardProps
 * @property {Product} product - Экземпляр чистой доменной сущности Товар
 */

/**
 * UI-компонент карточки товара в каталоге.
 * Слой: Presentation (Client Component)
 * Методология: БЭМ (Стилизуется через класс .product-card)
 *
 * @param {ProductCardProps} props
 * @returns {React.JSX.Element}
 */
export function ProductCard({ product }) {
	const addItem = useCartStore((state) => state.addItem);
	
	const handleAddToCart = () => {
		addItem(product, 1);
	}
	
	return (
			<article className="product-card">
				{/* Имитация изображения товара (финтех-заглушка) */}
				<div className="product-card__image-placeholder">🛒</div>
				<h3 className="product-card__title">{product.title}</h3>
				<p className="product-card__price">{`${product.price} KZT`}</p>
				<button className="product-card__button" onClick={handleAddToCart}>
					В корзину
				</button>
			</article>
	);
}
