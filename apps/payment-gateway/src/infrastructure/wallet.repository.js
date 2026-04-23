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
   * Находит кошелек и блокирует строку (ACID FOR UPDATE)
   * @param {string} id
   * @param {Object} client - DB Client
   */
  async findByIdForUpdate(id, client) {
    const { sql, params } = this.#qb
      .from('wallets')
      .select('*')
      .where('id', id)
      .forUpdate()
      .build();

    const result = await client.query(sql, params);
    return result.rows[0] || null;
  }

  /**
   * Подготовка SQL для обновления баланса
   * @param {string} id
   * @param {number} newBalance
   */
  updateBalance(id, newBalance) {
    return this.#qb
      .update('wallets', { balance: newBalance })
      .where('id', id)
      .build();
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
