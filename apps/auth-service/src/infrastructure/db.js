import pg from 'pg';

// Данные берем из docker-compose.yml
const pool = new pg.Pool({
  user: 'postgres',
  password: 'void_password',
  host: '127.0.0.1',
  port: 5433,
  database: 'void_db',
});

/**
 * Обертка для выполнения запросов.
 * Инкапсулирует логику пула соединений.
 */
export const db = {
  /**
   * Выполняет SQL запрос с параметрами
   * @param {string} text - SQL текст
   * @param {Array} params - Параметры запроса
   */
  query: (text, params) => pool.query(text, params),

  /**
   * Закрывает все соединения (нужно для тестов)
   */
  close: () => pool.end()
};
