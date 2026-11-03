import { Product } from '../domain/product.entity.js';

/**
 * Изолированный API-клиент для работы с бэкендом маркетплейса.
 * Слой: Application (Infrastructure Gateway)
 */
export class MarketplaceApiClient {
	#baseUrl;
	
	/**
	 * @param {string} baseUrl - Корневой URL бэкенд-сервиса е-коммерса
	 */
	constructor(baseUrl) {
		this.#baseUrl = baseUrl;
	}
	
	/**
	 * Запрос списка доступных товаров с сервера
	 * @returns {Promise} Массив доменных сущностей товаров
	 */
	async getProducts() {
		const response = await fetch(`${this.#baseUrl}/api/bff/products`);
		const rawProducts = await response.json();
		
		if (!Array.isArray(rawProducts)) {
			throw new Error(rawProducts.error || 'Invalid server response contract');
		}
		
		return rawProducts.map(data => new Product({
			id: data.id,
			title: data.title,
			price: Number(data.price),
			stock: Number(data.stock)
		}));
	}
	
	/**
	 * Запрос одного товара по ID с сервера
	 * @param {string} id - Уникальный UUID товара
	 * @returns {Promise} Доменная сущность товара
	 */
	async getProductById(id) {
		const response = await fetch(`${this.#baseUrl}/api/bff/products/${id}`);
		const rawProduct = await response.json();
		
		if (!rawProduct || rawProduct.error) {
			throw new Error(rawProduct?.error || 'Product fetch contract mismatch');
		}
		
		return new Product({
			id: rawProduct.id,
			title: rawProduct.title,
			price: Number(rawProduct.price),
			stock: Number(rawProduct.stock)
		});
	}
	
	/**
	 * Отправка заказа на оформление через BFF гейтвей
	 * @param {Object} input
	 * @param {number} input.userId - ID пользователя
	 * @param {string} input.productId - UUID товара
	 * @param {number} input.quantity - Количество
	 * @returns {Promise<Object>} Данные ответа (success, orderId)
	 */
	async createOrder({ userId, productId, quantity }) {
		const response = await fetch(`${this.#baseUrl}/api/bff/orders`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ userId, productId, quantity }),
		});
		
		const data = await response.json();
		
		if (!response.ok || data.error) {
			throw new Error(data.error || 'BFF orders route execution failed');
		}
		
		return data;
	}
}
