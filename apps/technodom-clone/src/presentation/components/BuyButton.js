'use client';

import React from 'react';
import { useCartStore } from '@/application/cart.store.js';
import { Button } from "@/presentation/shared/Button.js";

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
			<Button
					title="Добавить в корзину"
					className="product-detail__buy-btn"
					onClick={handleAddToCart}/>
	);
}
