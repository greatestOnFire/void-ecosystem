import { User } from '../domain/user.entity.js';

/**
 * Репозиторий для работы с пользователями в БД.
 * Слой: Infrastructure
 */
export class UserRepository {
  #qb;

  /**
   * @param {Object} qb - Экземпляр QueryBuilder
   */
  constructor(qb) {
    this.#qb = qb;
  }

  /**
   * Превращает сущность User в SQL INSERT запрос
   * @param {User} user
   * @returns {{ sql: string, params: any[] }}
   */
  save(user) {
    this.#qb.insertInto('users', {email: user.email, password_hash: user.passwordHash});

    return this.#qb.build();
  }
}
