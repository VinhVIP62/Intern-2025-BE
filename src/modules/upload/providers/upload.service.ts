import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ImageType } from '@common/enum/image.enum';
import { imageType, videoType } from '@common/types/file.type';

@Injectable()
export class UploadService {
	async uploadFile(
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

	async uploadMultipleFiles(files: Express.Multer.File[], folder: string = 'posts') {
		const imageExtensions = imageType.split('|');
		const videoExtensions = videoType.split('|');
		// console.log(imageExtensions);
		// console.log(videoExtensions);
		const uploadPromises = files.map(async file => {
			let type: 'image' | 'video' = 'image';
			const extension = file.originalname.split('.').pop()?.toLowerCase();
			const isImage = extension && imageExtensions.includes(extension);
			const isVideo = extension && videoExtensions.includes(extension);
			const { url, publicId } = await this.uploadFile(file, folder);
			if (isImage) {
				type = 'image';
			}
			if (isVideo) {
				type = 'video';
			}
			return { url: url, publicId: publicId, type: type };
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
		try {
			await cloudinary.uploader.destroy(publicId);
		} catch (error) {
			console.log('error in delete image from cloudinary');
			console.log(error);
			for (let i = 0; i < 3; i++) {
				try {
					await cloudinary.uploader.destroy(publicId);
					break;
				} catch (error) {
					console.log('error in delete image from cloudinary');
					console.log(error);
				}
			}
		}
	}
	async uploadVideo(
		file: Express.Multer.File,
		folder: string = 'videos',
	): Promise<{ url: string; publicId: string }> {
		return new Promise((resolve, reject) => {
			cloudinary.uploader
				.upload_stream(
					{
						folder: folder,
						resource_type: 'video',
						transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }],
					},
					(error, result) => {
						if (error) return reject(error);
						resolve({ url: result!.secure_url, publicId: result!.public_id });
					},
				)
				.end(file.buffer);
		});
	}
}
