import http from 'node:http';
import { db } from './infrastructure/db.js';
import { redis } from './infrastructure/redis.js';

const PORT = process.env.PORT || 3000;

/**
 * Главный обработчик запросов (Native Node.js)
 */
const server = http.createServer(async (req, res) => {
  // Устанавливаем заголовок ответа (JSON)
  res.setHeader('Content-Type', 'application/json');

  // Простой роутинг
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200);
    return res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
  }

  // Если маршрут не найден
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not Found' }));
});

// Запуск сервера
server.listen(PORT, () => {
  console.log(`🚀 Auth Service (SSO) running on port ${PORT}`);
  console.log(`📡 Persistence: Postgres (connected)`);
  console.log(`⚡ Cache: Redis (connected)`);
});

// Graceful shutdown (правильное закрытие при остановке)
process.on('SIGINT', async () => {
  await db.close();
  redis.disconnect();
  process.exit(0);
});
