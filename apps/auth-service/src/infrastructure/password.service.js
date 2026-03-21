import argon2 from 'argon2';

/**
 * Сервис для безопасной работы с паролями.
 * Использует алгоритм Argon2id.
 */
export class PasswordService {
  /**
   * Создает криптографический хэш пароля.
   * @param {string} password - Открытый пароль
   * @returns {Promise<string>} Хэш пароля
   */
  async hash(password) {
    // Используем дефолтные безопасные параметры argon2id
    return await argon2.hash(password, {
      type: argon2.argon2id
    });
  }

  /**
   * Проверяет соответствие пароля хэшу.
   * @param {string} hash - Хэш из базы данных
   * @param {string} password - Введенный пользователем пароль
   * @returns {Promise<boolean>} Результат проверки
   */
  async verify(hash, password) {
    try {
      return await argon2.verify(hash, password);
    } catch (err) {
      // Логируем ошибку, но возвращаем false для безопасности
      return false;
    }
  }
}
