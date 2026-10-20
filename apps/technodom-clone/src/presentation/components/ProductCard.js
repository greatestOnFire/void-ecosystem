'use client';

import React from 'react';
import Link from 'next/link';
import { useCartStore } from '../../application/cart.store.js';
import { Product } from '../../domain/product.entity.js';

/**
 * @typedef {Object} ProductCardProps
 * @property {Product} product - Экземпляр чистой доменной сущности Товар
 */

/**
 * UI-компонент карточки товара в каталоге.
 * @param {ProductCardProps} props
 * @returns {React.JSX.Element}
 */
export function ProductCard({ product }) {
	const addItem = useCartStore((state) => state.addItem);
	
	const handleAddToCart = (e) => {
		e.preventDefault();
		addItem(product, 1);
	};
	
	const installmentPrice = product.installmentPrice;
	
	return (
			<article className="product-card">
				<Link href={`/product/${product.id}`} className="product-card__link">
					<div className="product-card__image-placeholder">🛒</div>
					<h3 className="product-card__title">{product.title}</h3>
				</Link>
				
				<div className="product-card__installment">
					<span className="product-card__installment-badge">В рассрочку</span>
					<span className="product-card__installment-value">{`от ${installmentPrice.toLocaleString()} ₸/мес x 24`}</span>
				</div>
				<p className="product-card__price">{`${product.price.toLocaleString()} KZT`}</p>
				<button className="product-card__button" onClick={handleAddToCart}>
					В корзину
				</button>
			</article>
	);
}
