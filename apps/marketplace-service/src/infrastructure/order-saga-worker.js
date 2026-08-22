/**
 * Фоновый обработчик событий распределенных транзакций для маркетплейса.
 * Слой: Infrastructure (Event Driven Trigger)
 */
export class OrderSagaWorker {
	#redisSub;
	#orderRepo;
	#db;
	
	/**
	 * @param {Object} dependencies
	 * @param {Object} dependencies.redisSub - Дубликат клиента Redis для SUBSCRIBE
	 * @param {Object} dependencies.orderRepo - Репозиторий заказов
	 * @param {Object} dependencies.db - Драйвер базы данных
	 */
	constructor({ redisSub, orderRepo, db }) {
		this.#redisSub = redisSub;
		this.#orderRepo = orderRepo;
		this.#db = db;
	}
	
	async start() {
		const channelName = 'payment-events';
		await this.#redisSub.subscribe(channelName);
		
		this.#redisSub.on('message', async (channel, message) => {
			if (channel !== channelName) return;
			
			try {
				const event = JSON.parse(message);
				
				if ( event.type === 'TRANSFER_COMPLETED' ) {
					const orderId = event.payload.originalReferenceId;
					const query = this.#orderRepo.updateStatus(orderId, 'PAID');
					
					await this.#db.query(query.sql, query.params);
				}
				
			} catch (error) {
				console.error('OrderSagaWorker Error:', error.message);
			}
		});
	}
}
