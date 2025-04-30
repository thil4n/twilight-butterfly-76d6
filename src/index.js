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

		try {
			const publicKey = await publicKeyPromise; // reuse parsed key
			const { payload } = await jwtVerify(token, publicKey);

			// Call your backend
			const result = await fetch('https://haxtreme.info/netty/1/unsecured', {
				method: 'POST',
			});

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
