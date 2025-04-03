process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const apimResponse = await fetch('https://jwt-test.hacksland.net/netty/1/unsecured', {
	method: 'POST',
});
console.log('APIM Response:', apimResponse.body);
