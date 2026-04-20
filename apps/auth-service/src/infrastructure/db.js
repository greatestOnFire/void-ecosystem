import pg from 'pg';

/**
 * Пул соединений с Postgres.
 * Настройки приоритетно берутся из переменных окружения (Docker),
 * либо используются дефолты для локальной разработки.
 */
const pool = new pg.Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'void_password',
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5433', 10),
  database: process.env.DB_NAME || 'void_db',
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
