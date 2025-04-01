import { jwtVerify, importSPKI } from 'jose';

export default {
	async fetch(request, env) {
		try {
			// Extract JWT from Authorization header
			const authHeader = request.headers.get('Authorization');
			if (!authHeader || !authHeader.startsWith('Bearer ')) {
				return new Response(JSON.stringify({ error: 'Missing or invalid Authorization header' }), {
					status: 401,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

			// Decode the base64-encoded public key from Cloudflare Secret
			const publicKeyBase64 = env.JWT_PUBLIC_KEY;
			const publicKeyPem = new TextDecoder().decode(Uint8Array.from(atob(publicKeyBase64), (c) => c.charCodeAt(0)));

			// Import the public key for verification
			const publicKey = await importSPKI(publicKeyPem, 'RS256');

			// Define JWT Validation Parameters
			const EXPECTED_ISSUER = 'https://localhost:9443/oauth2/token';
			const EXPECTED_AUDIENCE = '2YHF9qnsHekqWLdyvW2lBLEJYeka';

			// Verify the JWT
			const { payload } = await jwtVerify(token, publicKey, {
				issuer: EXPECTED_ISSUER,
				audience: EXPECTED_AUDIENCE,
			});

			// Fetch Data from APIM Endpoint
			const apimResponse = await fetch('https://your-apim-endpoint.com/resource', {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`, // Forward JWT if needed
					Accept: 'application/json',
				},
			});

			if (!apimResponse.ok) {
				return new Response(JSON.stringify({ error: 'Failed to fetch APIM data' }), {
					status: apimResponse.status,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			// Parse the APIM response and return it
			const data = await apimResponse.json();
			return new Response(JSON.stringify({ message: 'JWT validation successful', data }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (error) {
			return new Response(JSON.stringify({ error: 'JWT verification failed', details: error.message }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	},
};
