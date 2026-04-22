/**
 * Репозиторий для управления транзакциями в БД.
 * Слой: Infrastructure
 */
export class TransactionRepository {
  #qb;

  /**
   * @param {Object} qb - Экземпляр QueryBuilder
   */
  constructor(qb) {
    this.#qb = qb;
  }

  /**
   * Превращает сущность Transaction в SQL INSERT
   * @param {import('../domain/transaction.entity.js').Transaction} transaction
   * @param {string} status - Статус транзакции (PENDING, COMPLETED, FAILED)
   * @returns {{ sql: string, params: any[] }}
   */
  save(transaction, status) {

    this.#qb.insertInto('transactions', {
      wallet_id: transaction.walletId,
      amount: transaction.amount,
      type: transaction.type,
      status: status
    });

    return this.#qb.build();
  }
}
