/**
 * Core Query Builder - фундамент экосистемы для генерации SQL.
 */
export class QueryBuilder {
  /** @type {string|null} */
  #table = null;

  /**
   * Указывает таблицу для запроса
   * @param {string} tableName
   * @returns {QueryBuilder}
   */
  from(tableName) {
    this.#table = tableName;
    return this;
  }

  /**
   * Собирает итоговую SQL строку
   * @returns {string}
   */
  build() {
    return `SELECT * FROM ${this.#table};`;
  }
}
