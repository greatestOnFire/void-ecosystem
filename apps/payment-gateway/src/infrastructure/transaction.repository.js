/**
 * Репозиторий для управления транзакциями в БД.
 * Слой: Infrastructure
 */
export class TransactionRepository {
  #createQb;
  
  /**
   * @param {Function} createQb - Фабрика инстансов QueryBuilder снаружи из DI
   */
  constructor(createQb) {
    this.#createQb = createQb;
  }
  
  /**
   * Превращает сущность Transaction в SQL INSERT
   * @param {import('../domain/transaction.entity.js').Transaction} transaction
   * @param {string} status - Статус транзакции (PENDING, COMPLETED, FAILED)
   * @param {string|null} [referenceId=null] - Сквозной ID оригинального заказа Саги
   * @returns {{ sql: string, params: any[] }}
   */
  save(transaction, status, referenceId = null) {
    const qb = this.#createQb();
    
    const insertData = {
      wallet_id: transaction.walletId,
      amount: transaction.amount,
      type: transaction.type,
      status: status
    };
    
    // Нативно добавляем поле связи микросервисов, если оно передано в Use Case
    if (referenceId) {
      insertData.reference_id = referenceId;
    }
    
    qb.insertInto('transactions', insertData);
    
    return qb.build();
  }
}
