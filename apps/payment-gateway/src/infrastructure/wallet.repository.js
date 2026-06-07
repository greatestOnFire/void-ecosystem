/**
 * Репозиторий для управления кошельками в БД.
 * Слой: Infrastructure (Data Mapper)
 */
export class WalletRepository {
  #createQb;
  
  /**
   * @param {Function} createQb - Фабрика инстансов QueryBuilder снаружи из DI
   */
  constructor(createQb) {
    this.#createQb = createQb;
  }
  
  /**
   * Находит кошелек и блокирует строку (ACID FOR UPDATE)
   * @param {string} id
   * @param {Object} client - DB Client
   */
  async findByIdForUpdate(id, client) {
    const  qb = this.#createQb();
    const { sql, params } = qb
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
    const qb = this.#createQb();
    return qb
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
    const qb = this.#createQb();
    const { sql, params } = qb
      .insertInto('wallets', {
        user_id: wallet.userId,
        balance: wallet.balance
      })
      .build();
    
    return { sql, params };
  }
}
