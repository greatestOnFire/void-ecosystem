'use client';

import React from 'react';
import { useCartStore } from '@/application/cart.store.js';

/**
 * UI-компонент модального окна корзины.
 * @returns {React.JSX.Element}
 */
export function CartModal() {
	const items = useCartStore((state) => state.items);
	const totalPrice = useCartStore((state) => state.totalPrice);
	const checkout = useCartStore((state) => state.checkout);
	
	if (items.length === 0) {
		return <div className="cart-modal">Корзина пуста</div>;
	}
	
	const handleCheckout = async () => {
		if (items.length > 0) {
			const firstItem = items[0];
			await checkout({
				userId: 42,
				productId: firstItem.product.id,
				quantity: firstItem.quantity
			});
		}
	};
	
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
				<button onClick={handleCheckout} className="cart-modal__checkout-btn">
					Оформить заказ
				</button>
			</section>
	);
}
