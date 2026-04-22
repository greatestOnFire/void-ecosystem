/**
 * Сущность Транзакции.
 * Слой: Domain (Entity)
 */
export class Transaction {
  #walletId;
  #amount;
  #type;

  /**
   * @param {Object} props
   * @param {string} props.walletId
   * @param {number} props.amount
   * @param {string} props.type - DEPOSIT или WITHDRAW
   */
  constructor({ walletId, amount, type }) {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    this.#walletId = walletId;
    this.#amount = amount;
    this.#type = type;
  }

  get amount() { return this.#amount; }
  get walletId() { return this.#walletId; }
  get type() { return this.#type; }
}
