import { jwtVerify, importSPKI } from 'jose';

const PUBLIC_KEY = `-----BEGIN CERTIFICATE-----
MIIDqTCCApGgAwIBAgIEZt+98jANBgkqhkiG9w0BAQsFADBkMQswCQYDVQQGEwJV
UzELMAkGA1UECAwCQ0ExFjAUBgNVBAcMDU1vdW50YWluIFZpZXcxDTALBgNVBAoM
BFdTTzIxDTALBgNVBAsMBFdTTzIxEjAQBgNVBAMMCWxvY2FsaG9zdDAeFw0yNDA5
MTAwMzMzMDZaFw0yNjEyMTQwMzMzMDZaMGQxCzAJBgNVBAYTAlVTMQswCQYDVQQI
DAJDQTEWMBQGA1UEBwwNTW91bnRhaW4gVmlldzENMAsGA1UECgwEV1NPMjENMAsG
A1UECwwEV1NPMjESMBAGA1UEAwwJbG9jYWxob3N0MIIBIjANBgkqhkiG9w0BAQEF
AAOCAQ8AMIIBCgKCAQEAuHsPfLjmBX2CKhe2xDPFH5blivapmOeI+GcDeKJDOSnh
Ns5xoeU+ORQmTiP0gTA3HaOV3ZkDrrs6Jlhg02zFasru0oZWtLfqjcNen+w5pOlV
gvi23Sp9IQm6lnfVPgIO8pZbja+rVdV5JN7UXcuoodplyDanAOJ8Zse9nC+P7J9X
TifeScrckpmNjogPUeMOa21gl+wnYDOuoVAPH+Ihx9/JZuEBYcOALVr6k9w3FwvS
92HZ8FsLaRvf524xDgX5lDpgRb6/z8xyuBfSDx7PEWUBw7mm96RTdsJUgOQJ0Xbj
NGd9kHa31V/GRF0jaZFSLfORDajU8eNxOWzv41MZuwIDAQABo2MwYTAUBgNVHREE
DTALgglsb2NhbGhvc3QwHQYDVR0OBBYEFCgJ3GHkOuWA/f1qqBpiM5h3XOrsMB0G
A1UdJQQWMBQGCCsGAQUFBwMBBggrBgEFBQcDAjALBgNVHQ8EBAMCBPAwDQYJKoZI
hvcNAQELBQADggEBABnhXVabvJcPuy5IcbG9j9/xwZL4Mj4Kt5Kjynb2CsYoo2XY
MT47jKuTeP2BPfOKpq4+RYVPE2CUOsrQvDjQKscfZ6NMmkX/LuiIBNQYtxZEBOnK
eUkodH5iacFWoUXgdBSiHmihc7M1aAX4aD0AqbK68bvzhCldqwBWCemL+ZhqsHc9
fGqjemG4/4l7KS5cor5hw/lLHjgvm6SCPx9URLZoaWSDXAqfmaX+zFwSPGV/HXmr
XZHJrH6O5C65GFw8q2zneBpjrV8s80D4kwYDHRlMWVqgWcXdX9nxYhUyPEpCf9Lp
Sta5aQSN1lofTZgDMovYHoSgKOWsX2ByxAfRnwE=
-----END CERTIFICATE-----`;

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

		return new Response(JSON.stringify({ message: 'Token received', token }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});

		if (!token.startsWith('eyJ4NXQ')) {
			return new Response(JSON.stringify({ error: 'Invalid Authorization header' }), {
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
