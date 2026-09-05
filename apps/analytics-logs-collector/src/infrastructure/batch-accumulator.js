/**
 * Компонент пакетной аккумуляции финтех-логов Саги в оперативной памяти Node.js.
 * Обеспечивает выполнение инварианта Batch-записи в OLAP СУБД ClickHouse.
 * Слой: Infrastructure
 */
export class BatchLogAccumulator {
	#clickhouse;
	#batchLimit;
	#buffer;
	#timer;
	
	/**
	 * @param {Object} dependencies
	 * @param {Object} dependencies.clickhouse - Клиент ClickHouse
	 * @param {number} [dependencies.batchLimit=1000] - Максимальный размер пачки
	 * @param {number} [dependencies.flushIntervalMs=5000] - Интервал сброса по времени в мс
	 */
	constructor({ clickhouse, batchLimit = 1000, flushIntervalMs = 5000 }) {
		this.#clickhouse = clickhouse;
		this.#batchLimit = batchLimit;
		this.#buffer = [];
		
		this.#timer = setInterval(() => {
			if (this.#buffer.length > 0) this.#flush().catch(() => {});
		}, flushIntervalMs);
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
	 * Метод для явного уничтожения сокетов/таймеров в конце тестов или при SIGINT Linux
	 */
	destroy() {
		if (this.#timer) {
			clearInterval(this.#timer); // 🟢 Чистим интервал из макрозадач Node.js
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
