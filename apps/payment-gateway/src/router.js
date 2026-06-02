// @ts-check

/**
 * Парсер нативного стрима JSON тела запроса
 * @param {import('node:http').IncomingMessage} req
 * @returns {Promise<any>}
 */
async function getJsonBody(req) {
	return new Promise((resolve, reject) => {
		let body = '';
		req.on('data', chunk => { body += chunk; });
		req.on('end', () => {
			try { resolve(JSON.parse(body || '{}')); }
			catch (e) { reject(new Error('Invalid JSON')); }
		});
	});
}

/**
 * Вспомогательный метод ответа
 */
function sendJson(res, data, statusCode = 200) {
	res.writeHead(statusCode, { 'Content-Type': 'application/json' });
	res.end(JSON.stringify(data));
}

/**
 * Главный роутер шлюза платежей.
 * Слой: Infrastructure (API Dispatcher)
 *
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {Object} context
 * @param {import('./use-cases/transfer-funds.js').TransferFunds} context.transferFunds
 * @param {import('./use-cases/deposit-funds.js').DepositFunds} context.depositFunds
 */
export async function router(req, res, context) {
	const { method, url } = req;
	const { transferFunds, depositFunds } = context;
	
	try {
		// Хелсчек для Docker
		if (method === 'GET' && url === '/health') {
			return sendJson(res, { status: 'ok' });
		}
		
		if (method === 'POST' && url === '/payment/transfer') {
			const data = await getJsonBody(req);
			const idempotencyKey = String(req.headers['x-idempotency-key'] || '');
			
			const result = await transferFunds.execute({
				...data,
				idempotencyKey
			});
			
			return sendJson(res, result, 200);
		}
		
		// Если роут не найден
		return sendJson(res, { error: 'Not Found' }, 404);
		
	} catch (error) {
		console.error('API Error:', error);
		return sendJson(res, { error: error.message || 'Internal Server Error' }, 400);
	}
}
