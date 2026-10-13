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
		
		// Защитный инвариант: если бэк вернул ошибку или не массив, выбрасываем исключение для TanStack Query
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
}
