// @ts-check

/**
 * Фоновый обработчик команд распределенных транзакций (Saga Pattern).
 * Слой: Infrastructure (Event Driven Trigger)
 */
export class SagaWorker {
	#redisSub;
	#transferFunds;
	#cancelTransfer; // Новая зависимость
	
	/**
	 * @param {Object} dependencies
	 * @param {Object} dependencies.redisSub - Отдельный клиент Redis для команд SUBSCRIBE
	 * @param {import('../use-cases/transfer-funds.js').TransferFunds} dependencies.transferFunds
	 * @param {import('../use-cases/cancel-transfer.js').CancelTransfer} dependencies.cancelTransfer
	 */
	constructor({ redisSub, transferFunds, cancelTransfer }) {
		this.#redisSub = redisSub;
		this.#transferFunds = transferFunds;
		this.#cancelTransfer = cancelTransfer;
	}
	
	/**
	 * Запуск фонового прослушивания канала Саги
	 * @returns {Promise<void>}
	 */
	async start() {
		const channelName = 'payment-commands';
		
		await this.#redisSub.subscribe(channelName);
		console.log(`📡 Saga Worker успешно подписан на Redis-канал: ${channelName}`);
		
		this.#redisSub.on('message', async (channel, message) => {
			if (channel !== channelName) return;
			
			try {
				const command = JSON.parse(message);
				
				if (command.type === 'PROCESS_TRANSFER') {
					await this.#transferFunds.execute(command.payload);
				}
				
				// ПЕРЕХВАТ КОМАНДЫ КОМПЕНСАЦИИ СУБД
				if (command.type === 'CANCEL_TRANSFER') {
					await this.#cancelTransfer.execute(command.payload);
				}
			} catch (error) {
				console.error('Saga Worker Execution Error:', error.message);
			}
		});
	}
}
