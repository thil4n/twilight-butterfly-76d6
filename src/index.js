export default {
	async fetch(request, env) {
		try {
			const apimResponse = await fetch('https://13.50.85.120:8243/netty/1/unsecured', {
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
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	},
};
