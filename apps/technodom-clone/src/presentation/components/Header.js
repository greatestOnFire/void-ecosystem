'use client';

import React, { useState } from 'react';
import { useCartStore } from '../../application/cart.store.js';
import { CartModal } from './CartModal.js';

/**
 * UI-компонент верхней навигационной панели маркетплейса.
 * @returns {React.JSX.Element}
 */
export function Header() {
	const items = useCartStore((state) => state.items);
	const [isCartOpen, setIsCartOpen] = useState(false);
	
	const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
	
	const toggleCart = () => {
		setIsCartOpen(!isCartOpen);
	};
	
	return (
			<header className="header">
				<div className="header__container">
					<div className="header__logo">Technodom</div>
					<div className="header__cart-wrapper">
						<button className="header__cart-button" onClick={toggleCart}>
							🛒 Корзина
							{totalQuantity > 0 && (
									<span className="header__cart-count">{totalQuantity}</span>
							)}
						</button>
						{isCartOpen && <CartModal />}
					</div>
				</div>
			</header>
	);
}
