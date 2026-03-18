/**
 * Core Query Builder - фундамент экосистемы для генерации SQL.
 */
export class QueryBuilder {
  #table = null;
  #columns = [];
  #conditions = [];
  #params = [];

  select(...columns) {
    this.#columns = columns;
    return this;
  }

  from(tableName) {
    this.#table = tableName;
    return this;
  }

  /**
   * Добавляет условие WHERE (пока только равенство)
   * @param {string} column
   * @param {any} value
   * @returns {QueryBuilder}
   */
  where(column, value) {
    this.#params.push(value);
    const placeholder = `$${this.#params.length}`;
    this.#conditions.push(`${column} = ${placeholder}`);
    return this;
  }

  #buildSelect() {
    return this.#columns.length > 0 ? this.#columns.join(', ') : '*';
  }

  #buildWhere() {
    if (this.#conditions.length === 0) return '';
    return ` WHERE ${this.#conditions.join(' AND ')}`;
  }

  /**
   * Собирает итоговый объект для драйвера БД
   * @returns {{ sql: string, params: any[] }}
   */
  build() {
    if (!this.#table) {
      throw new Error('Table is not defined. Use .from() before build()');
    }

    const sql = `SELECT ${this.#buildSelect()} FROM ${this.#table}${this.#buildWhere()};`;

    return {
      sql,
      params: [...this.#params]
    };
  }
}
