'use client';

import React from 'react';
import { useCartStore } from '@/application/cart.store.js';

/**
 * UI-компонент верхней навигационной панели (Шапки) маркетплейса.
 * Выводит фирменный лог и реактивный счетчик товаров в корзине.
 * Слой: Presentation (Client Component)
 *
 * @returns {React.JSX.Element}
 */
export function Header() {
	const items = useCartStore((state) => state.items);
	
	const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
	
	return (
			<header className="header">
				<div className="header__container">
					<div className="header__logo">Technodom</div>
					<button className="header__cart-button">
						🛒 Корзина
						{totalQuantity > 0 && (
								<span className="header__cart-count">{totalQuantity}</span>
						)}
					</button>
				</div>
			</header>
	);
}
