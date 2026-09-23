'use client';

import React from 'react';
import { useCartStore } from '@/application/cart.store.js';

/**
 * UI-компонент модального окна корзины.
 * Отображает список выбранных доменных товаров и итоговую финтех-стоимость.
 * Слой: Presentation (Client Component)
 *
 * @returns {React.JSX.Element}
 */
export function CartModal() {
	const items = useCartStore((state) => state.items);
	const totalPrice = useCartStore((state) => state.totalPrice);
	
	if (items.length === 0) {
		return <div className="cart-modal">Корзина пуста</div>;
	}
	
	
	return (
			<section className="cart-modal">
				<h2 className="cart-modal__title">Ваша корзина</h2>
				<div className="cart-modal__list">
					{items.map((item) => (
							<div key={item.product.id} className="cart-modal__item">
								<span className="cart-modal__item-title">{item.product.title}</span>
								<span className="cart-modal__item-price">
              {item.quantity} шт. x {item.product.price} KZT
            </span>
							</div>
					))}
				</div>
				<div className="cart-modal__total">Итого: {totalPrice} KZT</div>
				<button className="cart-modal__checkout-btn">Оформить заказ</button>
			</section>
	);
}
