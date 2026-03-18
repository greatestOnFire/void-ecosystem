/**
 * @typedef {Object} QueryResult
 * @property {string} sql - Готовый SQL запрос с плейсхолдерами ($1, $2...)
 * @property {any[]} params - Массив значений для параметров
 */

/**
 * Core Query Builder - фундамент экосистемы для генерации SQL.
 * Реализует Fluent API и защиту от SQL-инъекций.
 */
export class QueryBuilder {
  /** @type {string|null} */
  #table = null;

  /** @type {string[]} */
  #columns = [];

  /** @type {string[]} */
  #conditions = [];

  /** @type {any[]} */
  #params = [];

  /** @type {'SELECT'|'INSERT'|'UPDATE'|'DELETE'} */
  #type = 'SELECT';

  /**
   * Выбор колонок (только для SELECT)
   * @param {...string} columns
   * @returns {this}
   */
  select(...columns) {
    this.#columns = [...new Set(columns.filter(Boolean))];
    return this;
  }

  /**
   * Установка целевой таблицы
   * @param {string} tableName
   * @returns {this}
   */
  from(tableName) {
    this.#table = tableName;
    return this;
  }

  /**
   * Добавление условия фильтрации
   * @param {string} column
   * @param {any} value
   * @returns {this}
   */
  where(column, value) {
    this.#params.push(value);
    const placeholder = `$${this.#params.length}`;
    this.#conditions.push(`${column} = ${placeholder}`);
    return this;
  }

  /**
   * Инициализация вставки данных
   * @param {string} tableName
   * @param {Object.<string, any>} data
   * @returns {this}
   */
  insertInto(tableName, data) {
    const keys = Object.keys(data);
    if (keys.length === 0) throw new Error('Insert data cannot be empty');

    this.#type = 'INSERT';
    this.#table = tableName;
    this.#columns = keys;
    this.#params = Object.values(data);
    return this;
  }

  /**
   * Инициализация обновления данных
   * @param {string} tableName
   * @param {Object.<string, any>} data
   * @returns {this}
   */
  update(tableName, data) {
    const keys = Object.keys(data);
    if (keys.length === 0) throw new Error('Update data cannot be empty');

    this.#type = 'UPDATE';
    this.#table = tableName;
    this.#columns = keys;
    this.#params = Object.values(data);
    return this;
  }

  /**
   * Инициализация удаления данных
   * @param {string} tableName
   * @returns {this}
   */
  deleteFrom(tableName) {
    this.#type = 'DELETE';
    this.#table = tableName;
    this.#params = [];
    this.#conditions = [];
    return this;
  }

  /** @private */
  #buildSelect() {
    const cols = this.#columns.length > 0 ? this.#columns.join(', ') : '*';
    const where = this.#conditions.length > 0 ? ` WHERE ${this.#conditions.join(' AND ')}` : '';
    return {
      sql: `SELECT ${cols} FROM ${this.#table}${where};`,
      params: this.#params
    };
  }

  /** @private */
  #buildInsert() {
    const cols = this.#columns.join(', ');
    const placeholders = this.#params.map((_, i) => `$${i + 1}`).join(', ');
    return {
      sql: `INSERT INTO ${this.#table} (${cols}) VALUES (${placeholders});`,
      params: this.#params
    };
  }

  /** @private */
  #buildUpdate() {
    const setClause = this.#columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
    const where = this.#conditions.length > 0 ? ` WHERE ${this.#conditions.join(' AND ')}` : '';
    return {
      sql: `UPDATE ${this.#table} SET ${setClause}${where};`,
      params: this.#params
    };
  }

  /** @private */
  #buildDelete() {
    const where = this.#conditions.length > 0 ? ` WHERE ${this.#conditions.join(' AND ')}` : '';
    return {
      sql: `DELETE FROM ${this.#table}${where};`,
      params: this.#params
    };
  }

  /**
   * Сборка итогового запроса
   * @returns {QueryResult}
   * @throws {Error} Если не указана таблица
   */
  build() {
    if (!this.#table) throw new Error('Table is not defined');

    if (this.#type === 'INSERT') return this.#buildInsert();
    if (this.#type === 'UPDATE') return this.#buildUpdate();
    if (this.#type === 'DELETE') return this.#buildDelete();
    return this.#buildSelect();
  }
}
