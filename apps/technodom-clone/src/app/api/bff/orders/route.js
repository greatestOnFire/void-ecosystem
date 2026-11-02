/**
 * Next.js BFF API Handler для оформления заказов.
 * Реализует паттерн сквозного транзитного буфера (Transparent Forwarding Stream).
 *
 * @param {Request} request - Нативный объект входящего HTTP-запроса Next.js
 * @returns {Promise<Response>} Нативный объект HTTP-ответа Next.js
 */
export async function POST(request) {
	try {
		const rawPayload = await request.text();
		
		const marketplaceUrl = process.env.MARKETPLACE_SERVICE_URL || 'http://localhost:3002';
		
		// Пересылаем сырые байты контракта данных «один в один» в микросервис
		const response = await fetch(`${marketplaceUrl}/api/orders`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: rawPayload
		});
		
		const responseData = await response.json();
		return Response.json(responseData, { status: response.status });
		
	} catch (error) {
		console.error('🚨 [BFF_CRITICAL_FORWARD_ERROR]:', error.message);
		return Response.json(
				{ error: `BFF transit failure: ${error.message}` },
				{ status: 500 }
		);
	}
}
