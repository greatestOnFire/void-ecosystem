/**
 * Сущность Пользователя (Domain Entity)
 * Отвечает за инварианты и бизнес-правила аккаунта.
 */
export class User {
  #email;
  #passwordHash;

  /**
   * @param {Object} params
   * @param {string} params.email
   * @param {string} params.passwordHash
   */
  constructor({ email, passwordHash }) {
    this.#validateEmail(email);
    this.#email = email;
    this.#passwordHash = passwordHash;
  }

  get email() { return this.#email; }
  get passwordHash() { return this.#passwordHash; }

  /**
   * Простейшая валидация email (бизнес-правило)
   * @param {string} email
   * @private
   */
  #validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
  }
}
