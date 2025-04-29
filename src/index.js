import { jwtVerify, importSPKI } from 'jose';

const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuHsPfLjmBX2CKhe2xDPF
H5blivapmOeI+GcDeKJDOSnhNs5xoeU+ORQmTiP0gTA3HaOV3ZkDrrs6Jlhg02zF
asru0oZWtLfqjcNen+w5pOlVgvi23Sp9IQm6lnfVPgIO8pZbja+rVdV5JN7UXcuo
odplyDanAOJ8Zse9nC+P7J9XTifeScrckpmNjogPUeMOa21gl+wnYDOuoVAPH+Ih
x9/JZuEBYcOALVr6k9w3FwvS92HZ8FsLaRvf524xDgX5lDpgRb6/z8xyuBfSDx7P
EWUBw7mm96RTdsJUgOQJ0XbjNGd9kHa31V/GRF0jaZFSLfORDajU8eNxOWzv41MZ
uwIDAQAB
-----END PUBLIC KEY-----`;

export default {
	async fetch(request, env) {
		// Extract JWT from Authorization header
		const authHeader = request.headers.get('Authorization');
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return new Response(JSON.stringify({ error: 'Missing or invalid Authorization header' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

		try {
			// Import the public key (SPKI format)
			const publicKey = await importSPKI(PUBLIC_KEY, 'RS256'); // or 'ES256' depending on your algorithm

			// Verify the JWT
			const { payload } = await jwtVerify(token, publicKey);

			return new Response(JSON.stringify({ message: 'Token is valid', payload }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err) {
			return new Response(JSON.stringify({ error: 'Invalid or expired token', details: err.message }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		try {
			return await fetch('https://haxtreme.info/netty/1/unsecured', {
				method: 'POST',
			});

			const responseText = await apimResponse.text();
			console.log('APIM Response Body:', responseText);

			if (!apimResponse.ok) {
				return new Response(JSON.stringify({ error: 'APIM call failed', status: apimResponse.status }), {
					status: apimResponse.status,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			return new Response(JSON.stringify({ message: 'JWT validation successful', apimResponse: responseText }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (error) {
			console.log('Error:', error);
			return new Response(JSON.stringify({ error: 'JWT verification failed', details: error.message }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	},
};
