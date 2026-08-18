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
		// Шаг 1: Дожидаемся самого сетевого ответа от сервера
		const response = await fetch(`${this.#baseUrl}/api/products`);
		
		// Шаг 2: Дожидаемся, пока Node.js распарсит тело ответа в сырой массив объектов
		const rawProducts = await response.json();
		
		// Шаг 3: Мапим сырые объекты в доменные сущности и СРАЗУ возвращаем результат!
		return rawProducts.map(data => new Product({
			id: data.id,
			title: data.title,
			price: data.price,
			stock: data.stock
		}));
	}
}
