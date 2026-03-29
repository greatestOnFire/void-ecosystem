import Redis from 'ioredis';

/**
 * Подключение к Redis для хранения сессий и кэша.
 * Данные берутся из docker-compose.yml
 */
export const redis = new Redis({
  host: 'localhost',
  port: 6379,
  // Если в будущем добавим пароль в docker-compose, пропишем здесь
});

redis.on('error', (err) => console.error('Redis Connection Error:', err));
