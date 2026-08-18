/**
 * Репозиторий для управления номенклатурой товаров каталога в БД.
 * Слой: Infrastructure (Data Mapper / Gateway)
 */
export class ProductRepository {
	#createQb;
	
	/**
	 * @param {Function} createQb - Фабрика инстансов QueryBuilder из DI контейнера
	 */
	constructor(createQb) {
		this.#createQb = createQb;
	}
	
	/**
	 * Генерация SQL-запроса на получение всех товаров каталога
	 * @returns {{ sql: string, params: any[] }} Объект запроса для драйвера pg
	 */
	findAll() {
		const qb = this.#createQb();
		
		const { sql, params } = qb
		.from('products')
		.build()
		
		return { sql: sql, params: params };
	}
}
