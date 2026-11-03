// apps/technodom-clone/src/presentation/components/CartView.js
'use client';

import React from 'react';
import { useCartStore } from '@/application/cart.store.js';
import { Button } from '../shared/Button.js';
import { InstallmentBadge } from '../shared/InstallmentBadge.js';

export function CartView() {
	const items = useCartStore((state) => state.items);
	const totalPrice = useCartStore((state) => state.totalPrice);
	const checkout = useCartStore((state) => state.checkout);
	const clearCart = useCartStore((state) => state.clearCart);
	
	const handleOrderCheckout = async () => {
		try {
			const result = await checkout();
			
			if (result.success) {
				alert(`Заказ успешно оформлен! ID: ${result.orderId} для пользователя: ${result.userId}`);
				clearCart();
			}
		} catch (error) {
			alert(`Ошибка финтех-чекаута: ${error.message}`);
		}
	};
	
	if (items.length === 0) {
		return <div className="cart-view__empty">Ваша корзина пуста. Вернитесь в каталог товаров.</div>;
	}
	
	return (
			<section className="cart-view">
				<div className="cart-view__container">
					<div className="cart-view__products">
						<h2 className="cart-view__title">Корзина товаров</h2>
						{items.map((item) => (
								<div key={item.product.id} className="cart-view__item">
									<span className="cart-view__item-title">{item.product.title}</span>
									<span className="cart-view__item-price">
										{`${item.quantity} шт. x ${item.product.price.toLocaleString()} ₸`}
									</span>
								</div>
						))}
					</div>
					
					<div className="cart-view__summary">
						<h3 className="cart-view__summary-title">Итого к оплате</h3>
						<div className="cart-view__total">{`${totalPrice.toLocaleString()} KZT`}</div>
						<InstallmentBadge price={Math.floor(totalPrice / 24)} />
						<Button
								title="Оформить заказ"
								onClick={handleOrderCheckout}
								className="cart-view__checkout-btn"
						/>
					</div>
				</div>
			</section>
	);
}
