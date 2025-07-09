import { Injectable } from '@nestjs/common';
import { GCSService } from './gcs.service';
import { bucketName } from '@configs/google-storage.config';

@Injectable()
export class FileService {
	constructor(private readonly gcsService: GCSService) {}

	generateSignedUrl(folder: string, filename: string, mimetype: string) {
		return this.gcsService.generateV4UploadSignedUrl(folder, filename, mimetype);
	}

	async deleteFile(filePath: string): Promise<void> {
		return this.gcsService.deleteFile(filePath);
	}

	async generateMultipleSignedUrls(
		folder: string,
		files: { filename: string; mimetype: string }[],
	) {
		const results = await Promise.all(
			files.map(file =>
				this.gcsService.generateV4UploadSignedUrl(folder, file.filename, file.mimetype),
			),
		);
		return results;
	}

	extractFilePathFromPublicUrl(publicUrl: string): string {
		const baseUrl = `https://storage.googleapis.com/${bucketName}/`;
		if (publicUrl.startsWith(baseUrl)) {
			return publicUrl.slice(baseUrl.length);
		}
		throw new Error('Invalid public URL');
	}
}
