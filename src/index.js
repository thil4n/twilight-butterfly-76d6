import { jwtVerify, importSPKI } from 'jose';

// Outside the fetch function, so it's computed only once
const PUBLIC_KEY_STR = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuHsPfLjmBX2CKhe2xDPF
H5blivapmOeI+GcDeKJDOSnhNs5xoeU+ORQmTiP0gTA3HaOV3ZkDrrs6Jlhg02zF
asru0oZWtLfqjcNen+w5pOlVgvi23Sp9IQm6lnfVPgIO8pZbja+rVdV5JN7UXcuo
odplyDanAOJ8Zse9nC+P7J9XTifeScrckpmNjogPUeMOa21gl+wnYDOuoVAPH+Ih
x9/JZuEBYcOALVr6k9w3FwvS92HZ8FsLaRvf524xDgX5lDpgRb6/z8xyuBfSDx7P
EWUBw7mm96RTdsJUgOQJ0XbjNGd9kHa31V/GRF0jaZFSLfORDajU8eNxOWzv41MZ
uwIDAQAB
-----END PUBLIC KEY-----`;

const ALGORITHM = 'RS256';

let publicKeyPromise = importSPKI(PUBLIC_KEY_STR, ALGORITHM);

// In-memory cache: token string → { payload, exp }
const tokenCache = new Map();

export default {
	async fetch(request, env) {
		const authHeader = request.headers.get('Authorization');
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return new Response(JSON.stringify({ error: 'Missing or invalid Authorization header' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const token = authHeader.split(' ')[1];

		// Check if cached
		const now = Math.floor(Date.now() / 1000);
		const cached = tokenCache.get(token);
		if (cached && cached.exp > now) {
			return new Response(JSON.stringify({ message: 'ok (cached)', payload: cached.payload }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		try {
			const publicKey = await publicKeyPromise;
			const { payload } = await jwtVerify(token, publicKey);

			// Cache it if it has an expiry
			if (payload.exp) {
				tokenCache.set(token, { payload, exp: payload.exp });
			}

			// Optional backend call
			await fetch('https://haxtreme.info/netty/1/unsecured', { method: 'POST' });

			return new Response(JSON.stringify({ message: 'ok', payload }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err) {
			return new Response(JSON.stringify({ error: 'Invalid or expired token', details: err.message }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	},
};
