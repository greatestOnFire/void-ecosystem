/**
 * Next.js BFF API Handler для каталога товаров
 * @returns {Promise<Response>} Нативный объект HTTP-ответа Next.js
 */
export async function GET() {
	try {
		const marketplaceUrl = process.env.MARKETPLACE_SERVICE_URL || 'http://localhost:3002';
		
		const response = await fetch(`${marketplaceUrl}/api/products`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			}
		});
		
		const responseData = await response.json();
		return Response.json(responseData, { status: response.status });
		
	} catch (error) {
		console.error('BFF_PRODUCTS_ROUTER_ERROR:', error.message);
		return Response.json(
				{ error: 'Internal Server Error via BFF' },
				{ status: 500 }
		);
	}
}
