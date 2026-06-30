import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';

// Расширяем внутреннюю тестовую заглушку, добавляя поддержку новой зависимости
class MockSagaWorker {
	#redisSub;
	#transferFunds;
	#cancelTransfer; // Новая потенциальная зависимость
	
	constructor({ redisSub, transferFunds, cancelTransfer = null }) {
		this.#redisSub = redisSub;
		this.#transferFunds = transferFunds;
		this.#cancelTransfer = cancelTransfer;
	}
	
	async start() {
		await this.#redisSub.subscribe('payment-commands');
		this.#redisSub.on('message', async (channel, message) => {
			try {
				const command = JSON.parse(message);
				
				if (command.type === 'PROCESS_TRANSFER') {
					await this.#transferFunds.execute(command.payload);
				}
				// Намеренно оставляем пропуск для CANCEL_TRANSFER, чтобы новый тест упал
			} catch (error) {
				// Логирование ошибок
			}
		});
	}
}

test('SagaWorker: должен перехватить команду из Redis и вызвать Use Case', async () => {
	let useCaseCalledWith = null;
	
	const mockRedisSub = new EventEmitter();
	mockRedisSub.subscribe = async () => {};
	
	const mockUseCase = {
		execute: async (payload) => {
			useCaseCalledWith = payload;
		}
	};
	
	const worker = new MockSagaWorker({
		redisSub: mockRedisSub,
		useCase: mockUseCase // Будет мапиться на transferFunds по дефолту заглушки
	});
	
	await worker.start();
	
	const commandPayload = { fromWalletId: 'w1', toWalletId: 'w2', amount: 100 };
	mockRedisSub.emit('message', 'payment-commands', JSON.stringify({
		type: 'PROCESS_TRANSFER',
		payload: commandPayload
	}));
	
	assert.deepStrictEqual(useCaseCalledWith, commandPayload);
});


test('SagaWorker: должен перехватить команду CANCEL_TRANSFER и вызвать сценарий отката', async () => {
	let cancelUseCaseCalledWith = null;
	
	const mockRedisSub = new EventEmitter();
	mockRedisSub.subscribe = async () => {};
	
	const mockTransferFunds = { execute: async () => {} };
	const mockCancelTransfer = {
		execute: async (payload) => {
			cancelUseCaseCalledWith = payload;
		}
	};
	
	const worker = new MockSagaWorker({
		redisSub: mockRedisSub,
		transferFunds: mockTransferFunds,
		cancelTransfer: mockCancelTransfer
	});
	
	await worker.start();
	
	const commandPayload = {
		fromWalletId: 'w_shop',
		toWalletId: 'w_user',
		amount: 100,
		originalReferenceId: 'tx-123'
	};
	
	mockRedisSub.emit('message', 'payment-commands', JSON.stringify({
		type: 'CANCEL_TRANSFER',
		payload: commandPayload
	}));
	
	// Этот ассерт упадет (RED), так как логика обработки типа CANCEL_TRANSFER еще не написана
	assert.deepStrictEqual(cancelUseCaseCalledWith, commandPayload);
});
