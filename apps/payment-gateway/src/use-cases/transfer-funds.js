import { Transaction } from '../domain/transaction.entity.js';

/**
 * @typedef {Object} TransferInput
 * @property {string} fromWalletId - ID кошелька отправителя
 * @property {string} toWalletId - ID кошелька получателя
 * @property {number} amount - Сумма перевода
 * @property {string} [idempotencyKey] - Уникальный ключ операции
 */

export class TransferFunds {
  #walletRepo;
  #transactionRepo;
  #db;
  #redis; // Приватное поле для кэша

  /**
   * @param {Object} dependencies
   * @param {Object} dependencies.walletRepo
   * @param {Object} dependencies.transactionRepo
   * @param {Object} dependencies.db
   * @param {Object} dependencies.redis
   */
  constructor({ walletRepo, transactionRepo, db, redis }) {
    this.#walletRepo = walletRepo;
    this.#transactionRepo = transactionRepo;
    this.#db = db;
    this.#redis = redis; // Внедряем зависимость через Composition Root
  }

  /**
   * @param {TransferInput} input
   */
  async execute({ fromWalletId, toWalletId, amount, idempotencyKey }) {
    // 1. Проверяем ключ в Redis (если он передан)
    if (idempotencyKey) {
      const redisKey = `idemp:${idempotencyKey}`;
      const cachedResult = await this.#redis.get(redisKey);

      if (cachedResult) {
        // Если ключ найден — возвращаем старый ответ без похода в БД
        return JSON.parse(cachedResult);
      }
    }

    const client = await this.#db.getTransactionClient();

    try {
      await client.query('BEGIN');

      const sender = await this.#walletRepo.findByIdForUpdate(fromWalletId, client);
      if (!sender) throw new Error('Sender wallet not found');

      if (Number(sender.balance) < amount) throw new Error('Insufficient funds');

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

      const successResult = { success: true };

      if (idempotencyKey) {
        await this.#redis.set(`idemp:${idempotencyKey}`, JSON.stringify(successResult), 'EX', 86400);
      }

      return successResult;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
