import crypto from 'node:crypto'

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
	#eventBus;
	
	/**
	 * @param {Object} dependencies
	 * @param {Object} dependencies.productRepo
	 * @param {Object} dependencies.orderRepo
	 * @param {Object} dependencies.db
	 * @param {Object} dependencies.eventBus
	 */
	constructor({ productRepo, orderRepo, db, eventBus }) {
		this.#productRepo = productRepo;
		this.#orderRepo = orderRepo;
		this.#db = db;
		this.#eventBus = eventBus;
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
		
		const orderId = crypto.randomUUID();
		
		// Получаем изолированного клиента из пула СУБД
		const client = await this.#db.getTransactionClient();
		
		try {
			await client.query('BEGIN')
			
			// Генерируем SQL-инструкцию через наш Data Mapper репозиторий
			const insertQuery = this.#orderRepo.save({
				id: orderId,
				userId,
				productId,
				quantity,
				status: 'PENDING'
			});
			
			await client.query(insertQuery.sql, insertQuery.params );
			
			await client.query('COMMIT');
			
			const totalAmount = product.price * quantity;
			
			await this.#eventBus?.publish('payment-commands', {
				type: 'PROCESS_TRANSFER',
				payload: {
					amount: totalAmount,
					originalReferenceId: productId,
				}
			})
			
			return { success: true, orderId };
		} catch (error) {
			// При любом сбое — откатываем изменения локально
			await client.query('ROLLBACK');
			throw error;
		} finally {
			// Обязательно возвращаем клиента обратно в пул соединений Linux/Postgres
			client.release();
		}
	}
}
