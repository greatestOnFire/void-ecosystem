/**
 * Next.js BFF API Handler
 * @param {Request} request - Нативный объект входящего HTTP-запроса Next.js
 * @returns {Promise<Response>} Нативный объект HTTP-ответа Next.js
 */
export async function POST(request) {
	try {
		const body = await request.json();
		const marketplaceUrl = process.env.MARKETPLACE_SERVICE_URL || 'http://localhost:3002';
		
		const response = await fetch(`${marketplaceUrl}/api/orders`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				userId: body.userId,
				productId: body.productId,
				quantity: body.quantity
			})
		});
		
		const responseData = await response.json();
		return Response.json(responseData, { status: response.status });
		
	} catch (error) {
		console.error('BFF_ORDERS_ROUTER_ERROR:', error.message);
		return Response.json(
				{ error: 'Internal Server Error via BFF' },
				{ status: 500 }
		);
	}
}
