/**
 * Доменная сущность Товара (Domain Entity).
 * Отвечает за инварианты и бизнес-правила конкретной номенклатуры маркетплейса.
 * Слой: Domain
 */
export class Product {
	/** @type {string} */
	#id;
	/** @type {string} */
	#title;
	/** @type {number} */
	#price;
	/** @type {number} */
	#stock;
	
	/**
	 * @param {Object} params
	 * @param {string} params.id - Уникальный идентификатор товара
	 * @param {string} params.title - Наименование товара
	 * @param {number} params.price - Стоимость в KZT
	 * @param {number} params.stock - Доступное количество на складе
	 */
	constructor({ id, title, price, stock }) {
		this.#validateTitle(title);
		this.#validatePrice(price);
		this.#validateStock(stock);
		
		this.#id = id;
		this.#title = title.trim();
		this.#price = price;
		this.#stock = stock;
	}
	
	get id() { return this.#id; }
	get title() { return this.#title; }
	get price() { return this.#price; }
	get stock() { return this.#stock; }
	
	/**
	 * Валидация наименования
	 * @param {string} title
	 * @private
	 */
	#validateTitle(title) {
		if (!title || typeof title !== 'string' || !title.trim()) {
			throw new Error('Title cannot be empty');
		}
	}
	
	/**
	 * Валидация стоимости
	 * @param {number} price
	 * @private
	 */
	#validatePrice(price) {
		if (typeof price !== 'number' || price < 0) {
			throw new Error('Price cannot be negative');
		}
	}
	
	/**
	 * Валидация остатков
	 * @param {number} stock
	 * @private
	 */
	#validateStock(stock) {
		if (typeof stock !== 'number' || stock < 0 || !Number.isInteger(stock)) {
			throw new Error('Stock must be a non-negative integer');
		}
	}
}
