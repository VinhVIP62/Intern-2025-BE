import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { IEnvVars } from '@configs/config';

@Injectable()
export class FileService {
	constructor(private readonly configService: ConfigService<IEnvVars>) {
		const cloudinaryConfig = this.configService.get('cloudinary', { infer: true });
		if (!cloudinaryConfig) {
			throw new Error('Cloudinary config is missing in environment variables');
		}
		cloudinary.config({
			cloud_name: cloudinaryConfig.cloud_name,
			api_key: cloudinaryConfig.api_key,
			api_secret: cloudinaryConfig.api_secret,
		});
	}

	async uploadFile(file: Express.Multer.File): Promise<UploadApiResponse> {
		return new Promise((resolve, reject) => {
			// Determine resource type based on MIME type
			let resourceType: 'image' | 'video' | 'raw' = 'image';

			if (file.mimetype && file.mimetype.startsWith('video/')) {
				resourceType = 'video';
			} else if (file.mimetype && file.mimetype.startsWith('image/')) {
				resourceType = 'image';
			} else {
				resourceType = 'raw';
			}

			const uploadStream = cloudinary.uploader.upload_stream(
				{
					public_id: file.originalname,
					resource_type: resourceType,
					// Add video-specific options for better upload
					...(resourceType === 'video' && {
						chunk_size: 6000000, // 6MB chunks for better upload
					}),
				},
				(error, result) => {
					if (error) {
						return reject(error);
					}
					resolve(result as UploadApiResponse);
				},
			);
			uploadStream.end(file.buffer);
		});
	}

	async uploadFiles(files: Express.Multer.File[]): Promise<UploadApiResponse[]> {
		return Promise.all(files.map(file => this.uploadFile(file)));
	}
}
