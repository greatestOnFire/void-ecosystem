import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cart } from '../domain/cart.domain.js';

/**
 * Zustand-хранилище для управления состоянием корзины с персистентностью в localStorage.
 * Слой: Application (State Management)
 */
export const useCartStore = create(
		persist(
				(set, get) => ({
					items: [],
					totalPrice: 0,
					
					addItem: (product, quantity) => {
						const cartDomain = new Cart();
						
						get().items.forEach(item => {
							cartDomain.addItem(item.product, item.quantity);
						});
						
						cartDomain.addItem(product, quantity);
						
						set({
							items: cartDomain.items,
							totalPrice: cartDomain.totalPrice,
						});
					},
					
					checkout: async ({ userId, productId, quantity }) => {
						const response = await fetch('/api/bff/orders', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({ userId, productId, quantity }),
						});
						
						return await response.json();
					},
					
					clearCart: () => {
						set({ items: [], totalPrice: 0 });
					}
				}),
				{
					name: 'technodom-cart-storage',
					skipHydration: false
				}
		)
);
