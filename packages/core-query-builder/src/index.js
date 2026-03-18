/**
 * Core Query Builder - фундамент экосистемы для генерации SQL.
 */
export class QueryBuilder {
  #table = null;
  #columns = [];
  #conditions = [];
  #params = [];
  #type = 'SELECT';

  insertInto(tableName, data) {
    this.#type = 'INSERT';
    this.#table = tableName;
    this.#columns = Object.keys(data);
    this.#params = Object.values(data);
    return this;
  }

  select(...columns) {
    this.#columns = [...new Set(columns.filter(Boolean))];
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
    const cols = this.#columns.length > 0 ? this.#columns.join(', ') : '*';
    const where = this.#conditions.length > 0 ? ` WHERE ${this.#conditions.join(' AND ')}` : '';
    return {
      sql: `SELECT ${cols} FROM ${this.#table}${where};`,
      params: this.#params
    };
  }

  #buildInsert() {
    const cols = this.#columns.join(', ');
    const placeholders = this.#params.map((_, i) => `$${i + 1}`).join(', ');
    return {
      sql: `INSERT INTO ${this.#table} (${cols}) VALUES (${placeholders});`,
      params: this.#params
    };
  }

  build() {
    if (!this.#table) throw new Error('Table is not defined');

    if (this.#type === 'INSERT') return this.#buildInsert();
    return this.#buildSelect();
  }
}
