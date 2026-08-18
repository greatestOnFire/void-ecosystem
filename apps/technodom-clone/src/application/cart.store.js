import { create } from 'zustand';
import { Cart } from '../domain/cart.domain.js';

/**
 * @typedef {Object} CartState
 * @property {import('../domain/cart.domain.js').CartItem[]} items - Список элементов в корзине
 * @property {number} totalPrice - Общая стоимость корзины
 * @property {function(import('../domain/product.entity.js').Product, number): void} addItem - Экшен добавления товара
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
		// 1. Инициализируем доменный класс Cart текущими элементами из стейта
		const cartDomain = new Cart();
		
		// Переносим старые элементы из стейта Zustand в доменную модель корзины,
		// чтобы не потерять то, что уже добавлено
		get().items.forEach(item => {
			cartDomain.addItem(item.product, item.quantity);
		});
		
		// 2. Вызываем доменный метод (бизнес-логика, которую ты написал!)
		cartDomain.addItem(product, quantity);
		
		set({
			items: cartDomain.items,
			totalPrice: cartDomain.totalPrice,
		});
	}
}));
