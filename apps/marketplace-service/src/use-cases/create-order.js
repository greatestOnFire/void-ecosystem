// apps/marketplace-service/src/use-cases/create-order.js

import crypto from 'node:crypto';

/**
 * @typedef {Object} CreateOrderInput
 * @property {number} userId - ID покупателя
 * @property {string} productId - UUID приобретаемого товара
 * @property {number} quantity - Количество
 */

/**
 * Сценарий использования: Создание нового заказа (Use Case).
 */
export class CreateOrder {
	#productRepo;
	#orderRepo;
	#db;
	#eventBus;
	
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
		
		if (product.stock < quantity) {
			throw new Error('Insufficient stock');
		}
		
		const orderId = crypto.randomUUID();
		
		const idempotencyKey = crypto.randomUUID();
		
		const client = await this.#db.getTransactionClient();
		
		try {
			await client.query('BEGIN');
			
			const insertQuery = this.#orderRepo.save({
				id: orderId,
				userId,
				productId,
				quantity,
				status: 'PENDING'
			});
			
			await client.query(insertQuery.sql, insertQuery.params);
			await client.query('COMMIT');
			
			const totalAmount = product.price * quantity;
			
			await this.#eventBus?.publish('payment-commands', {
				type: 'PROCESS_TRANSFER',
				payload: {
					amount: totalAmount,
					originalReferenceId: orderId,
					idempotencyKey: idempotencyKey
				}
			});
			
			return { success: true, orderId };
		} catch (error) {
			await client.query('ROLLBACK');
			throw error;
		} finally {
			client.release();
		}
	}
}
