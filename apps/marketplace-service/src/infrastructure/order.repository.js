/**
 * Репозиторий для управления заказами маркетплейса в БД.
 * Слой: Infrastructure (Data Mapper)
 */
export class OrderRepository {
	#createQb;
	
	/**
	 * @param {Function} createQb - Фабрика инстансов QueryBuilder из DI контейнера
	 */
	constructor(createQb) {
		this.#createQb = createQb;
	}
	
	/**
	 * Подготовка SQL-инструкции для обновления статуса заказа.
	 * @param {string} id - UUID заказа
	 * @param {string} status - Новый статус (PAID, CANCELED)
	 * @returns {{ sql: string, params: any[] }} Контракт запроса для драйвера pg
	 */
	updateStatus(id, status) {
		const qb = this.#createQb();
		
		// Используем Fluent API нашего билдера для генерации UPDATE orders SET status = $1 WHERE id = $2;
		return qb
		.update('orders', { status })
		.where('id', id)
		.build();
	}
	
	/**
	 * Подготовка SQL-инструкции для вставки нового заказа.
	 * Возвращает чистый SQL/Params для оркестрации внутри ACID транзакции Use Case'ом.
	 *
	 * @param {Object} order - Данные заказа
	 * @param {string} order.id - UUID заказа
	 * @param {number} order.userId - ID покупателя
	 * @param {string} order.productId - UUID товара
	 * @param {number} order.quantity - Количество
	 * @param {string} order.status - Статус (PENDING, PAID, CANCELED)
	 * @returns {{ sql: string, params: any[] }} Контракт запроса для драйвера pg
	 */
	save(order) {
		const qb = this.#createQb();
		
		const { sql, params } = qb
					.insertInto( 'orders', {
						id: order.id,
						user_id: order.userId,
						product_id: order.productId,
						quantity: order.quantity,
						status: order.status,
					})
					.build();
		
		return { sql: sql, params: params };
	}
}
