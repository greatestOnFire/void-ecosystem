import { Transaction } from '../domain/transaction.entity.js';

/**
 * Сценарий пополнения баланса.
 * Слой: Use Cases
 */
export class DepositFunds {
  #transactionRepo;

  constructor(transactionRepo) {
    this.#transactionRepo = transactionRepo;
  }

  /**
   * Выполняет пополнение
   * @param {Object} input
   * @param {string} input.walletId
   * @param {number} input.amount
   */
  async execute({ walletId, amount }) {
    const transaction = new Transaction({ walletId, amount, type: 'DEPOSIT' });
    const result = this.#transactionRepo.save(transaction, 'COMPLETED');

    return { tx: result };
  }
}
