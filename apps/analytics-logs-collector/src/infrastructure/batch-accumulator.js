/**
 * Компонент пакетной аккумуляции финтех-логов Саги в оперативной памяти Node.js.
 * Обеспечивает выполнение инварианта Batch-записи в OLAP СУБД ClickHouse.
 * Слой: Infrastructure
 */
export class BatchLogAccumulator {
	#clickhouse;
	#batchLimit;
	#buffer;
	
	/**
	 * @param {Object} dependencies
	 * @param {Object} dependencies.clickhouse - Клиент ClickHouse
	 * @param {number} [dependencies.batchLimit=1000] - Максимальный размер пачки
	 */
	constructor({ clickhouse, batchLimit = 1000 }) {
		this.#clickhouse = clickhouse;
		this.#batchLimit = batchLimit;
		this.#buffer = [];
	}
	
	/**
	 * Добавляет лог в буфер оперативной памяти
	 * @param {Object} logEntry - Объект лога для аналитики
	 * @returns {Promise<void>}
	 */
	async push(logEntry) {

		this.#buffer.push(logEntry);
		
		if (this.#buffer.length >= this.#batchLimit) {
			await this.#flush();
		}
	}
	
	/**
	 * Сбрасывает накопленную пачку данных в СУБД ClickHouse
	 * @private
	 * @returns {Promise<void>}
	 */
	async #flush() {
		// Копируем накопленные логи для отправки
		const recordsToSend = [...this.#buffer];
		
		// Мгновенно очищаем оригинальный буфер в памяти,
		// чтобы новые входящие асинхронные события не накладывались
		this.#buffer = [];
		
		// Вызываем официальный HTTP API контракт вставки ClickHouse
		await this.#clickhouse.insert({
			table: 'saga_analytics_logs',
			values: recordsToSend,
			format: 'JSONEachRow',
		});
	}
}
