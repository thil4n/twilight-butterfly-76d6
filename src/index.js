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

			if (!token.startsWith('eyJ4NXQ')) {
				return new Response(JSON.stringify({ error: 'Invalid Authorization header' }), {
					status: 401,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			// Decode the base64-encoded public key from Cloudflare Secret
			const publicKeyBase64 = env.JWT_PUBLIC_KEY;
			const publicKeyPem = new TextDecoder().decode(Uint8Array.from(atob(publicKeyBase64), (c) => c.charCodeAt(0)));

			// Import the public key for verification
			const publicKey = await importSPKI(publicKeyPem, 'RS256');

			// Define JWT Validation Parameters
			const EXPECTED_ISSUER = 'https://localhost:9443/oauth2/token';
			const EXPECTED_AUDIENCE = '2YHF9qnsHekqWLdyvW2lBLEJYeka';

			// Verify the JWT
			// const { payload } = await jwtVerify(token, publicKey, {
			// 	issuer: EXPECTED_ISSUER,
			// 	audience: EXPECTED_AUDIENCE,
			// });

			// Fetch Data from APIM Endpoint
			const apimResponse = await fetch('https://jwt-test.hacksland.net/netty/1/unsecured', {
				method: 'POST',
			});

			console.log('APIM Response:', apimResponse);
			// Check if the APIM response is OK

			if (!apimResponse.ok) {
				return new Response(JSON.stringify(apimResponse), {
					status: apimResponse.status,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			return new Response(JSON.stringify({ message: 'JWT validation successful' }), {
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
