import { create } from 'zustand';
import { Cart } from '../domain/cart.domain.js';

/**
 * @typedef {Object} CheckoutInput
 * @property {number} userId - Уникальный идентификатор пользователя
 * @property {string} productId - Идентификатор оформляемого товара
 * @property {number} quantity - Количество товара
 */

/**
 * @typedef {Object} CheckoutResult
 * @property {boolean} success - Статус успешности операции
 * @property {string} orderId - Сгенерированный UUID заказа
 */

/**
 * @typedef {Object} CartState
 * @property {import('../domain/cart.domain.js').CartItem[]} items - Список элементов в корзине
 * @property {number} totalPrice - Общая стоимость корзины
 * @property {function(import('../domain/product.entity.js').Product, number): void} addItem - Экшен добавления товара
 * @property {function(CheckoutInput): Promise<CheckoutResult>} checkout - Асинхронный экшен оформления заказа через BFF
 */

/**
 * Zustand-хранилище для управления состоянием корзины на клиенте.
 * Слой: Application (State Management)
 * @type {import('zustand').UseBoundStore<import('zustand').StoreApi<CartState>>}
 */
export const useCartStore = create((set, get) => ({
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
	}
}));
