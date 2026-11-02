'use client';

import React from 'react';
import { useCartStore } from '../../application/cart.store.js';
import { Button } from '../shared/Button.js';
import { InstallmentBadge } from '../shared/InstallmentBadge.js';

/**
 * Интерактивный клиентский компонент детального просмотра и чекаута корзины.
 * Слой: Presentation (Client Component Island)
 */
export function CartView() {
	const items = useCartStore((state) => state.items);
	const totalPrice = useCartStore((state) => state.totalPrice);
	const checkout = useCartStore((state) => state.checkout);
	const clearCart = useCartStore((state) => state.clearCart);
	
	const handleOrderCheckout = async () => {
		if (items.length === 0) return;
		
		try {
			const firstItem = items[0];
			const result = await checkout({
				userId: 42,
				productId: firstItem.product.id,
				quantity: firstItem.quantity
			});
			
			if (result.success) {
				alert(`Заказ успешно оформлен! ID: ${result.orderId}`);
				
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
