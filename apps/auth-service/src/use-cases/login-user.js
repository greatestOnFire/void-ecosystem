/**
 * Сценарий входа пользователя (Аутентификация).
 * Слой: Use Cases (Application)
 */
export class LoginUser {
  #userRepo;
  #passwordService;

  constructor(userRepo, passwordService) {
    this.#userRepo = userRepo;
    this.#passwordService = passwordService;
  }

  /**
   * Выполняет сценарий логина
   * @param {Object} input
   * @param {string} input.email
   * @param {string} input.password
   * @throws {Error} Если данные неверны
   */
  async execute({ email, password }) {
    const user = await this.#userRepo.findByEmail(email);

    if (!user) {
      throw new Error('Invalid credentials')
    }

    const isPasswordCorrect = await this.#passwordService.verify(user.passwordHash, password);

    if (!isPasswordCorrect) {
      throw new Error('Invalid credentials')
    }

    return { email: user.email};
  }
}
