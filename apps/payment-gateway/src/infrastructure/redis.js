import Redis from 'ioredis';

/**
 * Подключение к Redis для хранения сессий и кэша.
 * Данные берутся из docker-compose.yml
 */
export const redis = new Redis({
  // В Docker это будет 'redis' (имя сервиса), локально - '127.0.0.1'
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  // Если в будущем добавим пароль в docker-compose, пропишем здесь
});

redis.on('error', (err) => console.error('Redis Connection Error:', err));
