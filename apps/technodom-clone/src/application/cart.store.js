import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cart } from '../domain/cart.domain.js';
import { MarketplaceApiClient } from './api.client.js';

export const useCartStore = create(
		persist(
				(set, get) => ({
					items: [],
					totalPrice: 0,
					accessToken: null,
					sessionId: null,
					authUserId: null,
					
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
					
					login: async (email, password) => {
						const response = await fetch('/api/bff/auth/login', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ email, password })
						});
						
						const data = await response.json();
						if (!response.ok || data.error) {
							throw new Error(data.error || 'Auth execution failed');
						}
						
						const fakeUserIdFromEmail = Math.abs(email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
						
						set({
							accessToken: data.accessToken,
							sessionId: data.sessionId,
							authUserId: fakeUserIdFromEmail
						});
						
						return data;
					},
					
					register: async (email, password) => {
						const response = await fetch('/api/bff/auth/register', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ email, password })
						});
						
						const data = await response.json();
						if (!response.ok || data.error) {
							throw new Error(data.error || 'Registration failed');
						}
						return data;
					},
					
					logout: () => {
						set({
							accessToken: null,
							sessionId: null,
							authUserId: null
						});
						if (typeof window !== 'undefined') {
							localStorage.removeItem('void_session_user_id');
						}
					},
					
					
					checkout: async () => {
						const items = get().items;
						if (items.length === 0) throw new Error('Cart is empty');
						
						const firstItem = items[0];
						const apiClient = new MarketplaceApiClient('');
						
						
						let targetUserId = get().authUserId;
						
						if (!targetUserId) {
							let sessionUserId = typeof window !== 'undefined' ? localStorage.getItem('void_session_user_id') : null;
							if (!sessionUserId) {
								sessionUserId = Math.floor(100000 + Math.random() * 900000).toString();
								if (typeof window !== 'undefined') {
									localStorage.setItem('void_session_user_id', sessionUserId);
								}
							}
							targetUserId = Number(sessionUserId);
						}
						
						const result = await apiClient.createOrder({
							userId: targetUserId,
							productId: firstItem.product.id,
							quantity: firstItem.quantity
						});
						
						return {
							...result,
							userId: targetUserId
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
