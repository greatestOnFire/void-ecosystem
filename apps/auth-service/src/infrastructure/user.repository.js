import { User } from '../domain/user.entity.js';

/**
 * Репозиторий для работы с пользователями в БД.
 * Слой: Infrastructure (Data Mapper)
 */
export class UserRepository {
  #qb;
  #db;

  /**
   * @param {Object} qb - Экземпляр QueryBuilder
   * @param {Object} db - Экземпляр обертки над pg (Postgres)
   */
  constructor(qb, db) {
    this.#qb = qb;
    this.#db = db;
  }

  /**
   * Поиск пользователя по email для аутентификации
   * @param {string} email
   * @returns {Promise<{id: number, email: string, passwordHash: string}|null>}
   */
  async findByEmail(email) {
    // 1. Строим SQL запрос через наш Core QB
    const { sql, params } = this.#qb
      .from('users')
      .select('id', 'email', 'password_hash')
      .where('email', email)
      .build();

    // 2. Выполняем запрос в реальной БД
    const result = await this.#db.query(sql, params);

    if (result.rows.length === 0) return null;

    const row = result.rows[0];

    // 3. Мапим данные (Database Row -> Plain Object для Use Case)
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash // Превращаем snake_case в camelCase
    };
  }

  /**
   * Превращает сущность User в SQL INSERT запрос (без выполнения)
   * @param {User} user
   * @returns {{ sql: string, params: any[] }}
   */
  save(user) {
    // ВАЖНО: Мы не выполняем query тут, так как Use Case ожидает SQL/Params
    // для последующего выполнения в транзакции или логирования.
    return this.#qb
      .insertInto('users', {
        email: user.email,
        password_hash: user.passwordHash
      })
      .build();
  }
}
