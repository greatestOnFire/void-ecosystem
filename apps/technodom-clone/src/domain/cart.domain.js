/**
 * @typedef {Object} CartItem
 * @property {import('./product.entity.js').Product} product - Объект доменного товара
 * @property {number} quantity - Количество товара в корзине
 */

/**
 * Доменная логика Корзины (Domain Aggregate / Entity).
 * Отвечает за инварианты расчета стоимости корзины маркетплейса.
 * Слой: Domain
 */
export class Cart {
	/** @type {CartItem[]} */
	#items;
	
	constructor() {
		this.#items = [];
	}
	
	/**
	 * Геттер для получения списка элементов корзины
	 * @returns {CartItem[]}
	 */
	get items() {
		return this.#items;
	}
	
	/**
	 * Добавление товара в корзину
	 * @param {import('./product.entity.js').Product} product - Доменный товар
	 * @param {number} quantity - Количество для добавления
	 */
	addItem(product, quantity) {
		const existingItem = this.#items.find(item => item.product.id === product.id);
		
		if (existingItem) {
			existingItem.quantity += quantity;
		} else {
			this.#items.push({ product, quantity });
		}
	}
	
	/**
	 * Геттер для динамического расчета общей стоимости всей корзины
	 * @returns {number} Итоговая сумма в KZT
	 */
	get totalPrice() {
		const result = this.#items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
		
		return result;
	}
}
