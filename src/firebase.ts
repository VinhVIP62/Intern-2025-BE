import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import * as path from 'path';

const serviceAccount = require(
	path.resolve(__dirname, '../alobo-sport-hub-firebase-adminsdk-fbsvc-c28bb97abe.json'),
);

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount as ServiceAccount),
});

export default admin;
