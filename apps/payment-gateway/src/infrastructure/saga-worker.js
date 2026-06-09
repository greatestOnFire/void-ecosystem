// @ts-check

/**
 * Фоновый обработчик команд распределенных транзакций (Saga Pattern).
 * Слой: Infrastructure (Event Driving Trigger)
 */
export class SagaWorker {
	#redisSub;
	#transferFunds;
	
	/**
	 * @param {Object} dependencies
	 * @param {Object} dependencies.redisSub - Отдельный заблокированный клиент Redis для команд SUBSCRIBE
	 * @param {import('../use-cases/transfer-funds.js').TransferFunds} dependencies.transferFunds
	 */
	constructor({ redisSub, transferFunds }) {
		this.#redisSub = redisSub;
		this.#transferFunds = transferFunds;
	}
	
	/**
	 * Запуск фонового прослушивания канала Саги
	 * @returns {Promise<void>}
	 */
	async start() {
		const channelName = 'payment-commands';
		
		// Подписываемся на выделенный финтех-канал команд
		await this.#redisSub.subscribe(channelName);
		console.log(`📡 Saga Worker успешно подписан на Redis-канал: ${channelName}`);
		
		this.#redisSub.on('message', async (channel, message) => {
			if (channel !== channelName) return;
			
			try {
				const command = JSON.parse(message);
				
				if (command.type === 'PROCESS_TRANSFER') {
					await this.#transferFunds.execute(command.payload);
				}
			} catch (error) {
				console.error('Saga Worker Execution Error:', error.message);
			}
		});
	}
}
