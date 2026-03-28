import pg from 'pg';

// Данные берем из docker-compose.yml
const pool = new pg.Pool({
  user: 'void_admin',
  password: 'void_password',
  host: 'localhost',
  port: 5432,
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
