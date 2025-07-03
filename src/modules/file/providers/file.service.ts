import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, DeleteApiResponse } from 'cloudinary';
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

	async deleteFiles(urls: string[]): Promise<DeleteApiResponse[]> {
		const deletePromises = urls.map(url => this.deleteFile(url));
		return Promise.all(deletePromises);
	}

	private async deleteFile(url: string): Promise<DeleteApiResponse> {
		return new Promise((resolve, reject) => {
			// Extract public_id from URL
			const publicId = this.extractPublicIdFromUrl(url);

			if (!publicId) {
				return reject(new Error(`Invalid Cloudinary URL: ${url}`));
			}

			// Determine resource type from URL
			let resourceType: 'image' | 'video' | 'raw' = 'image';
			if (url.includes('/video/')) {
				resourceType = 'video';
			} else if (url.includes('/raw/')) {
				resourceType = 'raw';
			}

			cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (error, result) => {
				if (error) {
					return reject(error);
				}
				resolve(result as DeleteApiResponse);
			});
		});
	}

	private extractPublicIdFromUrl(url: string): string | null {
		try {
			const urlParts = url.split('/');
			const uploadIndex = urlParts.findIndex(part => part === 'upload');

			if (uploadIndex === -1) {
				return null;
			}

			const pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
			const pathWithoutVersion = pathAfterUpload.replace(/^v\d+\//, '');

			let publicId = pathWithoutVersion;
			publicId = publicId.replace(/\.[^/.]+$/, '');
			publicId = publicId.replace(/_[^_]+$/, '');
			publicId = publicId.replace(/\/$/, '');

			// Giải mã URL encoding
			publicId = decodeURIComponent(publicId);

			return publicId;
		} catch (error) {
			return null;
		}
	}
}
