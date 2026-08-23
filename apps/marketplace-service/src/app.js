import http from 'node:http';
import Redis from 'ioredis';
import pg from 'pg';
import { QueryBuilder } from '@void/core-query-builder';

import { ProductRepository } from './infrastructure/product.repository.js';
import { OrderRepository } from './infrastructure/order.repository.js';
import { CreateOrder } from './use-cases/create-order.js';
import { OrderSagaWorker } from './infrastructure/order-saga-worker.js';
import { router } from './router.js';

const PORT = parseInt(process.env.PORT || '3002', 10);

// Инициализация инфраструктуры драйверов
const pool = new pg.Pool({
	user: process.env.DB_USER || 'postgres',
	password: process.env.DB_PASSWORD || 'void_password',
	host: process.env.DB_HOST || '127.0.0.1',
	port: parseInt(process.env.DB_PORT || '5433', 10),
	database: process.env.DB_NAME || 'void_db',
});
const db = { query: (text, params) => pool.query(text, params) };

const redis = new Redis({
	host: process.env.REDIS_HOST || '127.0.0.1',
	port: parseInt(process.env.REDIS_PORT || '6379', 10),
});
const redisSub = redis.duplicate();

// Сборка графа зависимостей
const createQb = () => new QueryBuilder();
const eventBus = { publish: async () => 1 };

const productRepo = new ProductRepository(createQb, db);
const orderRepo = new OrderRepository(createQb);
const createOrder = new CreateOrder({ productRepo, orderRepo, db, eventBus });

const orderSagaWorker = new OrderSagaWorker({ redisSub, orderRepo, db });
await orderSagaWorker.start();

const server = http.createServer(async (req, res) => {
	// 🟢 Передаем управление роутеру и прокидываем зависимости через контекст
	await router(req, res, { productRepo, createOrder });
});

server.listen(PORT, '0.0.0.0', () => {
	console.log(`🚀 Marketplace Backend Service ready on port ${PORT}`);
});

const shutdown = () => {
	server.close(async () => {
		await pool.end();
		redis.disconnect();
		redisSub.disconnect();
		process.exit(0);
	});
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
