import { getJsonBody , sendJson } from "./request-utils.js";

/**
 * Главный роутер маркетплейса (API Dispatcher).
 * Слой: Infrastructure
 *
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {Object} context - Инжектируемые зависимости (DI)
 * @param {Object} context.productRepo
 * @param {Object} context.createOrder
 */
export async function router(req, res, context) {
	const { method, url } = req;
	const { productRepo, createOrder } = context;
	
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
		
		if (method === 'POST' && url === '/api/orders') {
			const data = await getJsonBody(req);
			const result = await createOrder.execute(data);
			
			return sendJson(res, result, 201);
		}
		
		// 404 - Маршрут не найден
		return sendJson(res, { error: 'Route not found' }, 404);
		
	} catch (error) {
		return sendJson(res, { error: error.message }, 500);
	}
}
