/**
 * Фоновый обработчик распределенных финтех-событий Саги (Event Driven Trigger).
 * Перехватывает логи из Redis Pub/Sub и агрегирует их в оперативную память.
 * Слой: Infrastructure
 */
export class AnalyticsEventWorker {
	#redisSub;
	#accumulator;
	
	/**
	 * @param {Object} dependencies
	 * @param {Object} dependencies.redisSub - Отдельный клиент Redis для SUBSCRIBE
	 * @param {Object} dependencies.accumulator - Наш BatchLogAccumulator
	 */
	constructor({ redisSub, accumulator }) {
		this.#redisSub = redisSub;
		this.#accumulator = accumulator;
	}
	
	/**
	 * Запуск фонового прослушивания канала событий
	 * @returns {Promise<void>}
	 */
	async start() {
		const channelName = 'payment-events';
		await this.#redisSub.subscribe(channelName);
		
		this.#redisSub.on('message', async (channel, message) => {
			if (channel !== channelName) return;
			
			try {
				const event = JSON.parse(message);
				event.timestamp = new Date().toISOString();
				
				await this.#accumulator.push(event);
				
			} catch (error) {
				console.error('AnalyticsEventWorker Error:', error.message);
			}
		});
	}
}
