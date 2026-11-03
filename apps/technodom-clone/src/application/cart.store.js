import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cart } from '../domain/cart.domain.js';
import { MarketplaceApiClient } from './api.client.js';

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
					
					checkout: async () => {
						const items = get().items;
						if (items.length === 0) throw new Error('Cart is empty');
						
						const firstItem = items[0];
						const apiClient = new MarketplaceApiClient('');
						
						let sessionUserId = null;
						const isClient = typeof window !== 'undefined';
						
						if (isClient) {
							sessionUserId = localStorage.getItem('void_session_user_id');
						}
						
						if (!sessionUserId) {
							sessionUserId = Math.floor(100000 + Math.random() * 900000).toString();
							if (isClient) {
								localStorage.setItem('void_session_user_id', sessionUserId);
							}
						}
						
						const result = await apiClient.createOrder({
							userId: Number(sessionUserId),
							productId: firstItem.product.id,
							quantity: firstItem.quantity
						});
						
						return {
							...result,
							userId: sessionUserId
						};
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
