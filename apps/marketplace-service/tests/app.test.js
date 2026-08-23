import { test, after } from 'node:test';
import assert from 'node:assert/strict';

test('Marketplace App: должен успешно запускаться и отдавать статус ok на роут /health', async () => {
	// Переопределяем порт для тестов, чтобы не было конфликтов
	process.env.PORT = '3012';
	
	// Динамически импортируем приложение, запуская его Composition Root
	// Используем try-catch, так как файла src/app.js на диске еще нет
	try {
		await import('../src/app.js');
		
		// Делаем проверочный HTTP запрос к нашему серверу
		const response = await fetch('http://127.0.0');
		const data = await response.json();
		
		assert.strictEqual(response.status, 200);
		assert.strictEqual(data.status, 'ok');
	} catch (error) {
		// Если файла нет или граф зависимостей упал — тест закономерно упадет
		assert.fail(error.message);
	}
});
