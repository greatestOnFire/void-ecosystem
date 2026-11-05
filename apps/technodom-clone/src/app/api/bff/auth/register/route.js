/**
 * Next.js BFF API Handler для регистрации новых пользователей в SSO
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function POST(request) {
	try {
		const body = await request.json();
		const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3000';
		
		const response = await fetch(`${authServiceUrl}/auth/register`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email: body.email,
				password: body.password
			})
		});
		
		const responseData = await response.json();
		return Response.json(responseData, { status: response.status });
		
	} catch (error) {
		console.error('🚨 [BFF_AUTH_REGISTER_ERROR]:', error.message);
		return Response.json(
				{ error: 'Internal Server Error via BFF Auth Register' },
				{ status: 500 }
		);
	}
}
