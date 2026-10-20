/**
 * Next.js BFF API Handler для получения детальной информации о товаре по ID
 * @param {Request} request - Нативный объект входящего HTTP-запроса Next.js
 * @param {Object} context - Контекст запроса, содержащий динамические параметры пути
 * @param {Object} context.params - Параметры роутинга
 * @param {string} context.params.id - UUID запрашиваемого товара
 * @returns {Promise<Response>} Нативный объект HTTP-ответа Next.js
 */
export async function GET(request, { params }) {
	try {
		const { id } = params;
		const marketplaceUrl = process.env.MARKETPLACE_SERVICE_URL || 'http://localhost:3002';
		
		const response = await fetch(`${marketplaceUrl}/api/products/${id}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			}
		});
		
		const responseData = await response.json();
		return Response.json(responseData, { status: response.status });
		
	} catch (error) {
		console.error('BFF_PRODUCT_DETAIL_ROUTER_ERROR:', error.message);
		return Response.json(
				{ error: 'Internal Server Error via BFF' },
				{ status: 500 }
		);
	}
}
