import jwt from 'jsonwebtoken';

/**
 * Сервис для работы с JSON Web Tokens.
 * Слой: Infrastructure
 */
export class TokenService {
  #secret;
  #expiresIn;

  /**
   * @param {string} secret - Секретный ключ для подписи
   * @param {string} expiresIn - Время жизни (напр. '15m', '7d')
   */
  constructor(secret, expiresIn = '15m') {
    this.#secret = secret;
    this.#expiresIn = expiresIn;
  }

  /**
   * Генерирует Access Token
   * @param {Object} payload - Данные пользователя (email, id)
   * @returns {string} JWT токен
   */
  generateAccessToken(payload) {
    return jwt.sign(payload, this.#secret, { expiresIn: this.#expiresIn });
  }

  /**
   * Проверяет валидность токена
   * @param {string} token
   * @returns {Object} Декодированные данные
   * @throws {Error} Если токен просрочен или изменен
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, this.#secret);
    } catch (err) {
      throw new Error('Invalid or expired token');
    }
  }
}
