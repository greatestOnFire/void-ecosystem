/**
 * Репозиторий для управления сессиями в Redis.
 * Слой: Infrastructure
 */
export class SessionRepository {
  #redis;
  #prefix = 'session:';

  /**
   * @param {Object} redisInstance - Экземпляр ioredis
   */
  constructor(redisInstance) {
    this.#redis = redisInstance;
  }

  /**
   * Сохраняет сессию (Refresh Token ID -> User ID)
   * @param {string} sessionId
   * @param {string} userId
   * @param {number} ttlSeconds - Время жизни в секундах
   */
  async save(sessionId, userId, ttlSeconds) {
    // В Redis используем команду set с аргументом EX (expire)
    await this.#redis.set(
      `${this.#prefix}${sessionId}`,
      userId,
      'EX',
      ttlSeconds
    );
  }

  /**
   * Находит ID пользователя по ID сессии
   * @param {string} sessionId
   * @returns {Promise<string|null>}
   */
  async findUserId(sessionId) {
    return await this.#redis.get(`${this.#prefix}${sessionId}`);
  }

  /**
   * Удаляет сессию (Logout)
   * @param {string} sessionId
   */
  async delete(sessionId) {
    await this.#redis.del(`${this.#prefix}${sessionId}`);
  }
}
