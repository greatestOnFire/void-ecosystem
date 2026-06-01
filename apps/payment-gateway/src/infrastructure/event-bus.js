/**
 * @typedef {Object} SagaEvent
 * @property {string} type - Тип события (например, 'PAYMENT_PROCESSED')
 * @property {Object} payload - Данные события
 */

/**
 * Нативная шина событий на базе Redis Pub/Sub для реализации паттерна Saga.
 * Слой: Infrastructure
 */
export class EventBus {
  #redis;

  /**
   * @param {Object} redisClient - Экземпляр клиента ioredis
   */
  constructor(redisClient) {
    this.#redis = redisClient;
  }

  /**
   * Публикует событие в указанный канал распределенной транзакции
   * @param {string} channel - Имя канала (топика)
   * @param {SagaEvent} event - Объект события
   * @returns {Promise<number>} Количество подписчиков, получивших сообщение
   */
  async publish(channel, event) {

    return await this.#redis.publish(channel, JSON.stringify(event));

  }
}
