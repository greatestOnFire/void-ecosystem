/**
 * Сущность Кошелька.
 * Слой: Domain (Entity)
 */
export class Wallet {
  #userId;
  #balance;

  /**
   * @param {Object} props
   * @param {number} props.userId
   * @param {number} props.balance
   */
  constructor({ userId, balance }) {
    if (balance < 0) {
      throw new Error('Balance cannot be negative');
    }

    this.#userId = userId;
    this.#balance = balance;
  }

  get userId() { return this.#userId; }
  get balance() { return this.#balance; }

  /**
   * Простая логика изменения баланса (без сохранения в БД)
   * @param {number} amount
   */
  addFunds(amount) {
    this.#balance += amount;
  }
}
