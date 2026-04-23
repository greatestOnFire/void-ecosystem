import { Transaction } from '../domain/transaction.entity.js';

/**
 * @typedef {Object} TransferInput
 * @property {string} fromWalletId - ID отправителя
 * @property {string} toWalletId - ID получателя
 * @property {number} amount - Сумма
 */

/**
 * Сценарий перевода между кошельками.
 * Гарантирует атомарность: либо оба баланса обновлены, либо никто.
 */
export class TransferFunds {
  #walletRepo;
  #transactionRepo;
  #db;

  constructor({ walletRepo, transactionRepo, db }) {
    this.#walletRepo = walletRepo;
    this.#transactionRepo = transactionRepo;
    this.#db = db;
  }

  async execute({ fromWalletId, toWalletId, amount }) {
    const client = await this.#db.getTransactionClient();

    try {
      await client.query('BEGIN');

      // 1. Блокируем отправителя
      const sender = await this.#walletRepo.findByIdForUpdate(fromWalletId, client);
      if (!sender) throw new Error('Sender wallet not found');

      if (Number(sender.balance) < amount) throw new Error('Insufficient funds');

      // 2. Блокируем получателя
      const receiver = await this.#walletRepo.findByIdForUpdate(toWalletId, client);
      if (!receiver) throw new Error('Receiver wallet not found');

      const newSenderBalance = Number(sender.balance) - amount;
      const newReceiverBalance = Number(receiver.balance) + amount;

      const decQuery = this.#walletRepo.updateBalance(fromWalletId, newSenderBalance);
      const incQuery = this.#walletRepo.updateBalance(toWalletId, newReceiverBalance);

      await client.query(decQuery.sql, decQuery.params);
      await client.query(incQuery.sql, incQuery.params);

      const tx = new Transaction({ walletId: fromWalletId, amount, type: 'TRANSFER' });
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
