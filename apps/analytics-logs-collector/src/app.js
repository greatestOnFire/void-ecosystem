import { createClient } from '@clickhouse/client';
import Redis from 'ioredis';

import { BatchLogAccumulator } from './infrastructure/batch-accumulator.js';
import { AnalyticsEventWorker } from './infrastructure/analytics-worker.js';

// --- НАСТРОЙКИ ОКРУЖЕНИЯ (DOCKER / LOCAL) ---
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const CLICKHOUSE_HOST = process.env.CLICKHOUSE_HOST || 'http://127.0.0.1:8123';

console.log('⚙️ Инициализация Analytics Logs Collector...');

// 1. Подключаем драйвер ClickHouse HTTP API
const clickhouse = createClient({
	url: CLICKHOUSE_HOST,
	username: process.env.CLICKHOUSE_USER || 'void_analytics',
	password: process.env.CLICKHOUSE_PASSWORD || 'analytics_password',
	database: process.env.CLICKHOUSE_DB || 'void_analytics_db',
});

// 2. Подключаем драйвер Redis
const redis = new Redis({ host: REDIS_HOST, port: 6379 });
const redisSub = redis.duplicate(); // Дубликат для SUBSCRIBE

// 3. Создаем пакетный аккумулятор логов (лимит 3 для MVP, сброс каждые 5 сек)
const accumulator = new BatchLogAccumulator({
	clickhouse,
	batchLimit: 3,
	flushIntervalMs: 5000
});

const worker = new AnalyticsEventWorker({redisSub, accumulator});

await worker.start();

console.log('🚀 Analytics Logs Collector успешно запущен в фоновом режиме!');

// --- GRACEFUL SHUTDOWN (Очистка ресурсов POSIX Linux) ---
const shutdown = async () => {
	console.log('\n🛑 Останавливаем Analytics Logs Collector...');
	
	// Чистим интервальный таймер аккумулятора, чтобы процесс Node.js закрылся мгновенно
	accumulator.destroy();
	
	// Закрываем сетевые сокеты
	redis.disconnect();
	redisSub.disconnect();
	await clickhouse.close();
	
	console.log('👋 Сервис успешно остановлен.');
	process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
