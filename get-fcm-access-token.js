const { GoogleAuth } = require('google-auth-library');

async function getAccessToken() {
	const auth = new GoogleAuth({
		keyFile: 'alobo-sport-hub-firebase-adminsdk-fbsvc-c28bb97abe.json',
		scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
	});
	const client = await auth.getClient();
	const accessToken = await client.getAccessToken();
	return accessToken.token;
}

getAccessToken()
	.then(token => console.log(token))
	.catch(console.error);
