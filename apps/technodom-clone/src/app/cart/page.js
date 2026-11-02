import React from 'react';
import { CartView } from '@/presentation/components/CartView.js';

/**
 * Выделенная страница корзины и оформления заказа (Server Component).
 * Слой: Presentation (Next.js Routing)
 */
export default function CartPage() {
	return (
			<div className="cart-page-layout">
				<CartView />
			</div>
	);
}
