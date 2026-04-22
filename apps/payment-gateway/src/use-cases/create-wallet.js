import { Wallet } from '../domain/wallet.entity.js';

/**
 * Сценарий создания кошелька для нового пользователя.
 * Слой: Use Cases (Application)
 */
export class CreateWallet {
  #walletRepo;

  constructor(walletRepo) {
    this.#walletRepo = walletRepo;
  }

  /**
   * Выполняет сценарий
   * @param {Object} input
   * @param {number} input.userId
   */
  async execute({ userId }) {
    const wallet  = new Wallet({userId, balance: 0});

    return this.#walletRepo.save(wallet);
  }
}
