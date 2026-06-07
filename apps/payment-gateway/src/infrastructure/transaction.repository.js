import { QueryBuilder } from '@void/core-query-builder';

/**
 * Репозиторий для управления транзакциями в БД.
 * Слой: Infrastructure
 */
export class TransactionRepository {
  /**
   * Превращает сущность Transaction в SQL INSERT
   * @param {import('../domain/transaction.entity.js').Transaction} transaction
   * @param {string} status - Статус транзакции (PENDING, COMPLETED, FAILED)
   * @returns {{ sql: string, params: any[] }}
   */
  save(transaction, status) {
    const qb = new QueryBuilder();
    
    qb.insertInto('transactions', {
      wallet_id: transaction.walletId,
      amount: transaction.amount,
      type: transaction.type,
      status: status
    });

    return qb.build();
  }
}
