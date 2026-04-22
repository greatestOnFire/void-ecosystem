/**
 * Репозиторий для управления кошельками в БД.
 * Слой: Infrastructure (Data Mapper)
 */
export class WalletRepository {
  #qb;

  /**
   * @param {Object} qb - Экземпляр QueryBuilder
   */
  constructor(qb) {
    this.#qb = qb;
  }

  /**
   * Превращает сущность Wallet в SQL INSERT
   * @param {import('../domain/wallet.entity.js').Wallet} wallet
   * @returns {{ sql: string, params: any[] }}
   */
  save(wallet) {
    return this.#qb
      .insertInto('wallets', {
        user_id: wallet.userId,
        balance: wallet.balance
      })
      .build();
  }
}
