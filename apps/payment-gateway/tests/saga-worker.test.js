import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';

// Заглушка воркера
class MockSagaWorker {
	#redisSub;
	#useCase;
	
	constructor({ redisSub, useCase }) {
		this.#redisSub = redisSub;
		this.#useCase = useCase;
	}
	
	async start() {
		await this.#redisSub.subscribe('payment-commands');
		this.#redisSub.on('message', async (channel, message) => {
			const command = JSON.parse(message);
			await this.#useCase.execute(command.payload);
		});
	}
}

test('SagaWorker: должен перехватить команду из Redis и вызвать Use Case', async () => {
	let useCaseCalledWith = null;
	
	// Имитируем поведение ioredis через нативный EventEmitter
	const mockRedisSub = new EventEmitter();
	mockRedisSub.subscribe = async () => {};
	
	const mockUseCase = {
		execute: async (payload) => {
			useCaseCalledWith = payload;
		}
	};
	
	const worker = new MockSagaWorker({
		redisSub: mockRedisSub,
		useCase: mockUseCase
	});
	
	await worker.start();
	
	// Имитируем прилет сообщения из Redis Pub/Sub
	const commandPayload = { fromWalletId: 'w1', toWalletId: 'w2', amount: 100 };
	mockRedisSub.emit('message', 'payment-commands', JSON.stringify({
		type: 'PROCESS_TRANSFER',
		payload: commandPayload
	}));
	
	// Тест должен проверить, что Use Case вызвался с правильными данными
	assert.deepStrictEqual(useCaseCalledWith, commandPayload);
});
