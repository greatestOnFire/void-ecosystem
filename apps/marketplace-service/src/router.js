// Вспомогательная утилита унифицированного ответа
function sendJson(res, data, status = 200) {
	res.writeHead(status, { 'Content-Type': 'application/json' });
	res.end(JSON.stringify(data));
}

/**
 * Главный роутер маркетплейса (API Dispatcher).
 * Слой: Infrastructure
 *
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {Object} context - Инжектируемые зависимости (DI)
 * @param {Object} context.productRepo
 */
export async function router(req, res, context) {
	const { method, url } = req;
	const { productRepo } = context;
	
	try {
		// GET /health - Хелсчек для Docker
		if (method === 'GET' && url === '/health') {
			return sendJson(res, { status: 'ok' });
		}
		
		// GET /api/products - Каталог товаров для фронтенда Next.js
		if (method === 'GET' && url === '/api/products') {
			const products = await productRepo.findAll();
			return sendJson(res, products);
		}
		
		// 404 - Маршрут не найден
		return sendJson(res, { error: 'Route not found' }, 404);
		
	} catch (error) {
		return sendJson(res, { error: error.message }, 500);
	}
}
