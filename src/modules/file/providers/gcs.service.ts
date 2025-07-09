import { Injectable } from '@nestjs/common';
import { storage, bucketName } from '@configs/google-storage.config';
import { v4 as uuid } from 'uuid';
import { InternalServerError } from '@common/exceptions';

@Injectable()
export class GCSService {
	async generateV4UploadSignedUrl(
		folder: string,
		filename: string,
		mimetype: string,
	): Promise<{ signedUrl: string; filePath: string }> {
		const bucket = storage.bucket(bucketName);
		const ext = filename.split('.').pop();
		const uniqueName = `${Date.now()}-${uuid()}.${ext}`;
		const filePath = `${folder}/${uniqueName}`;
		const file = bucket.file(filePath);

		const [signedUrl] = await file.getSignedUrl({
			version: 'v4',
			action: 'write',
			expires: Date.now() + 15 * 60 * 1000, // 15 phút
			contentType: mimetype,
		});

		const publicUrl = `https://storage.googleapis.com/${bucketName}/${filePath}`;

		return { signedUrl, filePath: publicUrl };
	}

	async deleteFile(filePath: string): Promise<void> {
		const bucket = storage.bucket(bucketName);
		const file = bucket.file(filePath);

		try {
			await file.delete();
		} catch (error: unknown) {
			if (error instanceof Error) {
				throw new InternalServerError('exception.file.googleError', {
					message: `${error.message}`,
				});
			} else {
				throw new InternalServerError('exception.file.unknown');
			}
		}
	}
}
