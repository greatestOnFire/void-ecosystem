import { Transaction } from '../domain/transaction.entity.js';

export class TransferFunds {
	#walletRepo;
	#transactionRepo;
	#db;
	#redis;
	#eventBus;
	
	/**
	 * @param {Object} dependencies
	 * @param {Object} dependencies.walletRepo
	 * @param {Object} dependencies.transactionRepo
	 * @param {Object} dependencies.db
	 * @param {Object} dependencies.redis
	 * @param {Object} dependencies.eventBus
	 */
	constructor({ walletRepo, transactionRepo, db, redis, eventBus }) {
		this.#walletRepo = walletRepo;
		this.#transactionRepo = transactionRepo;
		this.#db = db;
		this.#redis = redis;
		this.#eventBus = eventBus;
	}
	
	async execute({ fromWalletId, toWalletId, amount, idempotencyKey }) {
		if (idempotencyKey) {
			const redisKey = `idemp:${idempotencyKey}`;
			const cachedResult = await this.#redis.get(redisKey);
			if (cachedResult) return JSON.parse(cachedResult);
		}
		
		const client = await this.#db.getTransactionClient();
		
		try {
			await client.query('BEGIN');
			
			// --- ЗАЩИТА ОТ DEADLOCK: ДЕТЕРМИНИРОВАННЫЙ ПОРЯДОК БЛОКИРОВКИ СТРОК ---
			// Сортируем ID по алфавиту, чтобы параллельные транзакции всегда блокировали строки в одном порядке
			const orderedIds = [fromWalletId, toWalletId].sort();
			
			const walletsMap = {};
			for (const id of orderedIds) {
				walletsMap[id] = await this.#walletRepo.findByIdForUpdate(id, client);
			}
			
			// Восстанавливаем роли из карты по оригинальным ID
			const sender = walletsMap[fromWalletId];
			const receiver = walletsMap[toWalletId];
			
			if (!sender) throw new Error('Sender wallet not found');
			if (Number(sender.balance) < amount) throw new Error('Insufficient funds');
			if (!receiver) throw new Error('Receiver wallet not found');
			// ----------------------------------------------------------------------
			
			const newSenderBalance = Number(sender.balance) - amount;
			const newReceiverBalance = Number(receiver.balance) + amount;
			
			const decQuery = this.#walletRepo.updateBalance(fromWalletId, newSenderBalance);
			const incQuery = this.#walletRepo.updateBalance(toWalletId, newReceiverBalance);
			
			await client.query(decQuery.sql, decQuery.params);
			await client.query(incQuery.sql, incQuery.params);
			
			const tx = new Transaction({ walletId: fromWalletId, amount, type: 'TRANSFER' });
			const txQuery = this.#transactionRepo.save(tx, 'COMPLETED');
			await client.query(txQuery.sql, txQuery.params);
			
			await client.query('COMMIT');
			
			const successResult = { success: true };
			
			if (idempotencyKey) {
				await this.#redis.set(`idemp:${idempotencyKey}`, JSON.stringify(successResult), 'EX', 86400);
			}
			
			await this.#eventBus.publish('payment-events', {
				type: 'TRANSFER_COMPLETED',
				payload: { fromWalletId, toWalletId, amount }
			});
			
			return successResult;
		} catch (error) {
			await client.query('ROLLBACK');
			throw error;
		} finally {
			client.release();
		}
	}
}
