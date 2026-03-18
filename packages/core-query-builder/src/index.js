/**
 * Core Query Builder - фундамент экосистемы для генерации SQL.
 */
export class QueryBuilder {
  /** @type {string|null} */
  #table = null;

  /** @type {string[]} */
  #columns = [];

  /**
   * Указывает колонки для выбора
   * @param {...string} columns
   * @returns {QueryBuilder}
   */
  select(...columns) {
    this.#columns = columns;
    return this;
  }

  /**
   * Указывает таблицу для запроса
   * @param {string} tableName
   * @returns {QueryBuilder}
   */
  from(tableName) {
    this.#table = tableName;
    return this;
  }

  /** @private */
  #buildSelect() {
    return this.#columns.length > 0 ? this.#columns.join(', ') : '*';
  }

  /**
   * Собирает итоговую SQL строку
   * @returns {string}
   */
  build() {
    if (!this.#table) {
      throw new Error('Table is not defined. Use .from() before build()');
    }
    const cols = this.#buildSelect();
    return `SELECT ${cols} FROM ${this.#table};`;
  }
}
