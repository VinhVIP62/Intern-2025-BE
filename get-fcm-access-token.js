const { GoogleAuth } = require('google-auth-library');

async function getAccessToken() {
	const isProduction = process.env.NODE_ENV === 'production';
	let auth;

	if (isProduction) {
		// Use environment variables in production
		const credentials = {
			type: 'service_account',
			project_id: process.env.FIREBASE_PROJECT_ID,
			private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
			private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
			client_email: process.env.FIREBASE_CLIENT_EMAIL,
			client_id: process.env.FIREBASE_CLIENT_ID,
			auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
			token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
			auth_provider_x509_cert_url:
				process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL ||
				'https://www.googleapis.com/oauth2/v1/certs',
			client_x509_cert_url: process.env.FIREBASE_CLIENT_X59T_URL,
			universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN || 'googleapis.com',
		};

		auth = new GoogleAuth({
			credentials: credentials,
			scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
		});
	} else {
		// Use JSON file in development
		auth = new GoogleAuth({
			keyFile: 'alobo-sport-hub-firebase-adminsdk-fbsvc-c28bb97e.json',
			scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
		});
	}

	const client = await auth.getClient();
	const accessToken = await client.getAccessToken();
	return accessToken.token;
}

module.exports = { getAccessToken };
