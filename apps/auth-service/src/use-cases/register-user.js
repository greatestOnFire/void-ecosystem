import { User } from '../domain/user.entity.js';

/**
 * Сценарий регистрации нового пользователя.
 * Слой: Use Cases (Application)
 */
export class RegisterUser {
  #userRepo;
  #passwordService;

  constructor(userRepo, passwordService) {
    this.#userRepo = userRepo;
    this.#passwordService = passwordService;
  }

  /**
   * Выполняет сценарий регистрации
   * @param {Object} input
   * @param {string} input.email
   * @param {string} input.password
   */
  async execute({ email, password }) {
    const passwordHash = await this.#passwordService.hash(password);
    const user = new User({ email, passwordHash });

    return this.#userRepo.save(user);
  }
}
