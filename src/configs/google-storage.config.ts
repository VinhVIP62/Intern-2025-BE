import { Storage } from '@google-cloud/storage';
import { join } from 'path';

export const storage = new Storage({
	keyFilename: join(__dirname, '../../google-service-account.json'), // Đường dẫn tới file JSON key
	projectId: 'alobo-463309',
});

export const bucketName = 'alobo';
