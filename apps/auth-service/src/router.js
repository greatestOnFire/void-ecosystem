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

    if (method === 'POST' && url === '/auth/login') {
      const data = await getJsonBody(req);
      const user = await loginUser.execute(data);

      // Генерируем токен
      const accessToken = tokenService.generateAccessToken({ email: user.email });

      // Генерируем sessionId (в реальности это должен быть случайный UUID)
      const sessionId = Date.now().toString();

      // Сохраняем сессию в Redis (на 15 минут)
      await sessionRepo.save(sessionId, user.email, 900);

      return sendJson(res, { accessToken, sessionId });
    }

    // 404 - Маршрут не найден
    return sendJson(res, { error: 'Route not found' }, 404);

  } catch (error) {
    // Маппинг ошибок бизнес-логики на HTTP статусы
    const statusMap = {
      'Invalid email format': 400,
      'Invalid credentials': 401
    };
    // Централизованная обработка ошибок
    const status = statusMap[error.message] || 500;
    return sendJson(res, { error: error.message }, status);
  }
}
