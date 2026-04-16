import http from 'node:http';
import { db } from './infrastructure/db.js';
import { redis } from './infrastructure/redis.js';
import { QueryBuilder } from '@void/core-query-builder';

// Инфраструктура и Домен
import { UserRepository } from './infrastructure/user.repository.js';
import { SessionRepository } from './infrastructure/session.repository.js';
import { PasswordService } from './infrastructure/password.service.js';
import { TokenService } from './infrastructure/token.service.js';

// Сценарии (Use Cases)
import { RegisterUser } from './use-cases/register-user.js';
import { LoginUser } from './use-cases/login-user.js';

// Роутер
import { router } from './router.js';

const PORT = process.env.PORT || 3000;

// --- Инициализация (Composition Root) ---
const qb = new QueryBuilder();
const passwordService = new PasswordService();
const tokenService = new TokenService(process.env.JWT_SECRET || 'dev-secret', '15m');

const userRepo = new UserRepository(qb, db);
const sessionRepo = new SessionRepository(redis);

const registerUser = new RegisterUser(userRepo, passwordService);
const loginUser = new LoginUser(userRepo, passwordService);

/**
 * Главный сервер
 */
const server = http.createServer(async (req, res) => {
  // Передаем зависимости в роутер через контекст (объект зависимостей)
  await router(req, res, {
    registerUser,
    loginUser,
    tokenService,
    sessionRepo
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Auth Service ready on port ${PORT} (listening 0.0.0.0)`);
});

process.on('SIGINT', async () => {
  await db.close();
  redis.disconnect();
  process.exit(0);
});
