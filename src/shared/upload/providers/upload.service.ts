import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ImageType } from '@common/enum/image.enum';

@Injectable()
export class UploadService {
	async uploadImage(
		file: Express.Multer.File,
		folder: string = 'posts',
	): Promise<{ url: string; publicId: string }> {
		return new Promise((resolve, reject) => {
			cloudinary.uploader
				.upload_stream(
					{
						folder: folder,
						resource_type: 'auto',
						transformation: [
							{ width: 1000, height: 1000, crop: 'limit' },
							{ quality: 'auto' },
							{ fetch_format: 'auto' },
						],
					},
					(error, result) => {
						if (error) return reject(error);
						resolve({
							url: result!.secure_url,
							publicId: result!.public_id,
						});
					},
				)
				.end(file.buffer); // Memory storage: using file.buffer
		});
	}

	async uploadMultipleImages(files: Express.Multer.File[], folder: string = 'posts') {
		const uploadPromises = files.map(async file => {
			const { url, publicId } = await this.uploadImage(file, folder);
			return { url, publicId };
		});
		return Promise.all(uploadPromises);
	}
	async uploadAvatar(
		file: Express.Multer.File,
		userId: string,
	): Promise<{ url: string; publicId: string }> {
		return new Promise((resolve, reject) => {
			cloudinary.uploader
				.upload_stream(
					{
						folder: 'avatars',
						public_id: `avatar_${userId}`,
						overwrite: true,
						transformation: [
							{ width: 400, height: 400, crop: 'fill', gravity: 'face' },
							{ quality: 'auto' },
							{ fetch_format: 'auto' },
						],
					},
					(error, result) => {
						if (error) return reject(error);
						resolve({
							url: result!.secure_url,
							publicId: result!.public_id,
						});
					},
				)
				.end(file.buffer); // Memory storage: using file.buffer
		});
	}

	async uploadBackground(
		file: Express.Multer.File,
		userId: string,
	): Promise<{ url: string; publicId: string }> {
		return new Promise((resolve, reject) => {
			cloudinary.uploader
				.upload_stream(
					{
						folder: 'backgrounds',
						public_id: `background_${userId}`,
						overwrite: true,
						transformation: [
							{ width: 1000, height: 1000, crop: 'limit' },
							{ quality: 'auto' },
							{ fetch_format: 'auto' },
						],
					},
					(error, result) => {
						if (error) return reject(error);
						resolve({
							url: result!.secure_url,
							publicId: result!.public_id,
						});
					},
				)
				.end(file.buffer);
		});
	}

	async uploadUserImage(
		file: Express.Multer.File,
		userId: string,
		type: ImageType.AVATAR | ImageType.BACKGROUND,
	): Promise<{ url: string; publicId: string }> {
		const config = {
			[ImageType.AVATAR]: {
				folder: ImageType.AVATAR as string,
				publicId: `${ImageType.AVATAR}_${userId}`,
				transformation: [
					{ width: 400, height: 400, crop: 'fill', gravity: 'face' },
					{ quality: 'auto' },
					{ fetch_format: 'auto' },
				],
			},
			[ImageType.BACKGROUND]: {
				folder: ImageType.BACKGROUND as string,
				publicId: `${ImageType.BACKGROUND}_${userId}`,
				transformation: [
					{ width: 1000, height: 1000, crop: 'limit' },
					{ quality: 'auto' },
					{ fetch_format: 'auto' },
				],
			},
		};
		const uploadConfig = config[type];
		return new Promise((resolve, reject) => {
			cloudinary.uploader
				.upload_stream(
					{
						folder: uploadConfig.folder,
						public_id: uploadConfig.publicId,
						overwrite: true,
						transformation: uploadConfig.transformation,
					},
					(error, result) => {
						if (error) return reject(error);
						resolve({
							url: result!.secure_url,
							publicId: result!.public_id,
						});
					},
				)
				.end(file.buffer);
		});
	}

	async deleteImage(publicId: string): Promise<void> {
		await cloudinary.uploader.destroy(publicId);
	}
}
