import { Transaction } from '../domain/transaction.entity.js';

/**
 * @typedef {Object} DepositInput
 * @property {string} walletId - ID кошелька
 * @property {number} amount - Сумма пополнения
 */

/**
 * Сценарий пополнения баланса с гарантией ACID.
 * Слой: Use Cases (Application Layer)
 */
export class DepositFunds {
  /** @type {import('../infrastructure/transaction.repository.js').TransactionRepository} */
  #transactionRepo;
  /** @type {import('../infrastructure/wallet.repository.js').WalletRepository} */
  #walletRepo;
  /** @type {import('../infrastructure/db.js').db} */
  #db;

  /**
   * @param {Object} repos
   * @param {import('../infrastructure/transaction.repository.js').TransactionRepository} repos.transactionRepo
   * @param {import('../infrastructure/wallet.repository.js').WalletRepository} repos.walletRepo
   * @param {Object} db - Драйвер базы данных
   */
  constructor({ transactionRepo, walletRepo, db }) {
    this.#transactionRepo = transactionRepo;
    this.#walletRepo = walletRepo;
    this.#db = db;
  }

  /**
   * Выполняет атомарное пополнение баланса
   * @param {DepositInput} input
   * @returns {Promise<{ success: boolean }>}
   */
  async execute({ walletId, amount }) {
    const client = await this.#db.getTransactionClient();

    try {
      await client.query('BEGIN');

      // 1. Блокируем строку кошелька (FOR UPDATE)
      const walletData = await this.#walletRepo.findByIdForUpdate(walletId, client);
      if (!walletData) throw new Error('Wallet not found');

      const newBalance = Number(walletData.balance) + amount;

      const updateQuery = this.#walletRepo.updateBalance(walletId, newBalance);
      await client.query(updateQuery.sql, updateQuery.params);

      const tx = new Transaction({walletId, amount, type: 'DEPOSIT'});
      const txQuery = this.#transactionRepo.save(tx, 'COMPLETED');
      await client.query(txQuery.sql, txQuery.params);

      await client.query('COMMIT');
      return { success: true };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
