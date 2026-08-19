/**
 * @typedef {Object} CreateOrderInput
 * @property {number} userId - ID покупателя
 * @property {string} productId - UUID приобретаемого товара
 * @property {number} quantity - Количество
 */

/**
 * Сценарий использования: Создание нового заказа (Use Case).
 * Оркеструет проверку остатков, цен и транзакционную запись в СУБД.
 * Слой: Application (Use Cases)
 */
export class CreateOrder {
	#productRepo;
	#orderRepo;
	#db;
	
	/**
	 * @param {Object} dependencies
	 * @param {Object} dependencies.productRepo
	 * @param {Object} dependencies.orderRepo
	 * @param {Object} dependencies.db
	 */
	constructor({ productRepo, orderRepo, db }) {
		this.#productRepo = productRepo;
		this.#orderRepo = orderRepo;
		this.#db = db;
	}
	
	/**
	 * Выполняет бизнес-сценарий создания заказа
	 * @param {CreateOrderInput} input
	 * @returns {Promise<{ success: boolean, orderId: string }>}
	 */
	async execute({ userId, productId, quantity }) {
		const product = await this.#productRepo.findById(productId);
		
		if (!product) {
			throw new Error('Product not found');
		}
		
		if ( product.stock < quantity ) {
			throw new Error('Insufficient stock');
		}
		
		// Временная заглушка, чтобы каркас скомпилировался
		return { success: true, orderId: 'stub' };
	}
}
