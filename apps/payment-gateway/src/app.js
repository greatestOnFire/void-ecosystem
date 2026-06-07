import http from 'node:http';
import { db } from './infrastructure/db.js';
import { redis } from './infrastructure/redis.js';
import { QueryBuilder } from '@void/core-query-builder';
import { EventBus } from './infrastructure/event-bus.js';
import { router } from './router.js';

import { WalletRepository } from "./infrastructure/wallet.repository.js";
import  { TransactionRepository } from "./infrastructure/transaction.repository.js";

import { CreateWallet } from "./use-cases/create-wallet.js";
import { DepositFunds } from "./use-cases/deposit-funds.js";
import { TransferFunds } from "./use-cases/transfer-funds.js";

async function main() {
	const port = parseInt(process.env.PORT || '3001', 10);
	
	// Инициализируем общие зависимости
	const eventBus = new EventBus(redis);
	
	const walletRepo = new WalletRepository();
	const transactionRepo = new TransactionRepository();
	
	const createWallet = new CreateWallet(walletRepo);
	const depositFunds = new DepositFunds({ transactionRepo, walletRepo, db });
	const transferFunds = new TransferFunds({ walletRepo, transactionRepo, db, redis, eventBus })
	
	const server = http.createServer(async (req, res) => {
		// Передаем контекст со всеми юзкейсами и инфраструктурой в роутер
		await router(req, res, {
			db,
			redis,
			eventBus,
			createWallet,
			depositFunds,
			transferFunds
		});
	});
	
	server.listen(port, '0.0.0.0', () => {
		console.log(`🚀 Payment Gateway ready on port ${port} (listening 0.0.0.0)`);
	});
	
	// Graceful shutdown
	const shutdown = async () => {
		console.log('\nStopping payment gateway...');
		server.close(async () => {
			await db.close();
			redis.disconnect();
			console.log('Payment Gateway stopped gracefully.');
			process.exit(0);
		});
	};
	
	process.on('SIGINT', shutdown);
	process.on('SIGTERM', shutdown);
}

main().catch(console.error);
