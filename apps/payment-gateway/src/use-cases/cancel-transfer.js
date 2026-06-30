import { Transaction } from '../domain/transaction.entity.js';

/**
 * @typedef {Object} CancelTransferInput
 * @property {string} fromWalletId - Кошелек, с которого списываем (например, магазин)
 * @property {string} toWalletId - Кошелек, на который возвращаем (пользователь)
 * @property {number} amount - Сумма возврата
 * @property {string} originalReferenceId - ID оригинальной транзакции для аудита
 */

/**
 * Сценарий компенсирующей транзакции (Saga Compensation).
 * Асинхронно возвращает средства при распределенном сбое экосистемы.
 */
export class CancelTransfer {
	#walletRepo;
	#transactionRepo;
	#db;
	
	/**
	 * @param {Object} dependencies
	 * @param {Object} dependencies.walletRepo
	 * @param {Object} dependencies.transactionRepo
	 * @param {Object} dependencies.db
	 */
	constructor({ walletRepo, transactionRepo, db }) {
		this.#walletRepo = walletRepo;
		this.#transactionRepo = transactionRepo;
		this.#db = db;
	}
	
	/**
	 * Выполняет атомарный возврат средств
	 * @param {CancelTransferInput} input
	 * @returns {Promise<{ success: boolean }>}
	 */
	async execute({ fromWalletId, toWalletId, amount, originalReferenceId }) {
		const client = await this.#db.getTransactionClient();
		
		try {
			await client.query('BEGIN');
			
			// Защита от Deadlock: сортируем ID перед блокировкой строк
			const orderedIds = [fromWalletId, toWalletId].sort();
			const walletsMap = {};
			
			for (const id of orderedIds) {
				walletsMap[id] = await this.#walletRepo.findByIdForUpdate(id, client);
			}
			
			const sender = walletsMap[fromWalletId];   // Тот, у кого забираем возврат (магазин)
			const receiver = walletsMap[toWalletId];   // Тот, кому отдаем (пользователь)
			
			if (!sender || !receiver) {
				throw new Error('Compensation failed: wallets not found');
			}
			
			const newSenderBalance = Number(sender.balance) - amount;
			const newReceiverBalance = Number(receiver.balance) + amount;
			
			const decQuery = this.#walletRepo.updateBalance(fromWalletId, newSenderBalance);
			const incQuery = this.#walletRepo.updateBalance(toWalletId, newReceiverBalance);
			
			await client.query(decQuery.sql, decQuery.params);
			await client.query(incQuery.sql, incQuery.params);
			
			// Фиксируем транзакцию типа TRANSFER с пометкой возврата
			// В enterprise-системах тип кодируется как REVERSAL, но сущность Transaction требует DEPOSIT/WITHDRAW/TRANSFER.
			// Мы передаем оригинальный reference_id для сквозной аналитики
			const tx = new Transaction({ walletId: toWalletId, amount, type: 'TRANSFER' });
			const txQuery = this.#transactionRepo.save(tx, 'COMPLETED');
			
			// Напрямую добавляем reference_id в SQL-запрос для Саги
			const modifiedSql = txQuery.sql.replace(');', ', reference_id);').replace(');', `, $5);`);
			txQuery.params.push(originalReferenceId);
			
			await client.query(modifiedSql, txQuery.params);
			await client.query('COMMIT');
			
			return { success: true };
		} catch (error) {
			await client.query('ROLLBACK');
			throw error;
		} finally {
			client.release();
		}
	}
}
