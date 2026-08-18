/**
 * Репозиторий для управления номенклатурой товаров каталога в БД.
 * Слой: Infrastructure (Data Mapper)
 */
export class ProductRepository {
	#createQb;
	#db; // Новое приватное поле для драйвера БД
	
	/**
	 * @param {Function} createQb - Фабрика инстансов QueryBuilder
	 * @param {Object} db - Обертка над драйвером pg (Postgres)
	 */
	constructor(createQb, db) {
		this.#createQb = createQb;
		this.#db = db;
	}
	
	/**
	 * Получение всех товаров из БД
	 * @returns {Promise<any[]>} Массив строк из базы данных
	 */
	async findAll() {
		const qb = this.#createQb();
		const { sql, params } = qb.from('products').build();
		
		const result = await this.#db.query(sql, params);
		
		return result.rows;
	}
	
	/**
	 * Поиск товара по ID в БД
	 * @param {string} id
	 * @returns {Promise<Object|null>} Строка товара или null
	 */
	async findById(id) {
		const qb = this.#createQb();
		const { sql, params } = qb.from('products').where('id', id).build();
		
		const result = await this.#db.query(sql, params);
		
		if(!result.rows || result.rows.length === 0) return null;

		return result.rows[0];
	}
}
