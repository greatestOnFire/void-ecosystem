import { getJsonBody, sendJson } from './request-utils.js';

/**
 * Главный роутер (Dispatcher)
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {Object} context - Зависимости (DI)
 */
export async function router(req, res, context) {
  const { method, url } = req;
  const { registerUser, db } = context;

  try {
    // GET /health - Проверка состояния
    if (method === 'GET' && url === '/health') {
      return sendJson(res, { status: 'ok' });
    }

    // POST /auth/register - Регистрация пользователя
    if (method === 'POST' && url === '/auth/register') {
      const data = await getJsonBody(req);

      // Вызываем сценарий (Application Layer)
      const result = await registerUser.execute(data);

      // Выполняем SQL запрос через инъектированный драйвер (Infrastructure Layer)
      await db.query(result.sql, result.params);

      return sendJson(res, { message: 'User registered successfully' }, 201);
    }

    // 404 - Маршрут не найден
    return sendJson(res, { error: 'Route not found' }, 404);

  } catch (error) {
    // Централизованная обработка ошибок
    const status = error.message === 'Invalid email format' ? 400 : 500;
    return sendJson(res, { error: error.message }, status);
  }
}
