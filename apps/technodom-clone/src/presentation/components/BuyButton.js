'use client';

import React from 'react';
import { useCartStore } from '../../application/cart.store.js';

/**
 * Интерактивный клиентский компонент кнопки покупки для SSR страниц.
 * @param {Object} props
 * @param {Object} props.product - Данные товара для добавления
 * @returns {React.JSX.Element}
 */
export function BuyButton({ product }) {
	const addItem = useCartStore((state) => state.addItem);
	
	const handleAddToCart = () => {
		addItem(product, 1);
	};
	
	return (
			<button className="product-detail__buy-btn" onClick={handleAddToCart}>
				Добавить в корзину
			</button>
	);
}
