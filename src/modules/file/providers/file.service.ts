import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, DeleteApiResponse } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { IEnvVars } from '@configs/config';
import { FILE_TYPE_CONSTANTS, CloudinaryResourceType } from '@common/constants/file-types.constant';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { PassThrough } from 'stream';
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

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

	async uploadFile(file: Express.Multer.File, userId: string): Promise<UploadApiResponse> {
		return new Promise(async (resolve, reject) => {
			let buffer = file.buffer;
			let resourceType: CloudinaryResourceType =
				FILE_TYPE_CONSTANTS.CLOUDINARY_RESOURCE_TYPES.IMAGE;

			if (FILE_TYPE_CONSTANTS.ALLOWED_VIDEO_MIME_TYPES.includes(file.mimetype as any)) {
				resourceType = FILE_TYPE_CONSTANTS.CLOUDINARY_RESOURCE_TYPES.VIDEO;
				// Tối ưu video với ffmpeg
				try {
					buffer = await optimizeVideoWithFfmpeg(file.buffer);
				} catch (err) {
					return reject(err);
				}
			} else if (FILE_TYPE_CONSTANTS.ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype as any)) {
				resourceType = FILE_TYPE_CONSTANTS.CLOUDINARY_RESOURCE_TYPES.IMAGE;
				// Nếu là JPEG/JPG thì nén bằng mozjpeg và loại bỏ metadata
				if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
					try {
						const compressedBuffer = await sharp(file.buffer)
							.resize({ width: 1280, withoutEnlargement: true })
							.jpeg({ quality: 80, mozjpeg: true })
							.toBuffer(); // Không truyền withMetadata để loại bỏ metadata
						// So sánh size, chỉ upload file đã nén nếu nhỏ hơn file gốc
						if (compressedBuffer.length < file.buffer.length) {
							buffer = compressedBuffer;
						} else {
							buffer = file.buffer;
						}
					} catch (err) {
						return reject(err);
					}
				} else {
					// Các định dạng ảnh khác giữ nguyên logic cũ (resize, nén nếu có, không dùng mozjpeg)
					try {
						buffer = await sharp(file.buffer)
							.resize({ width: 1280, withoutEnlargement: true })
							.toBuffer();
					} catch (err) {
						return reject(err);
					}
				}
			} else {
				resourceType = FILE_TYPE_CONSTANTS.CLOUDINARY_RESOURCE_TYPES.RAW;
			}

			const timestamp = Date.now();
			const uuid = uuidv4();
			const originalName = file.originalname.replace(/\.[^/.]+$/, '');
			const publicId = `user_${userId}/${originalName}_${timestamp}_${uuid}`;

			const uploadStream = cloudinary.uploader.upload_stream(
				{
					public_id: publicId,
					resource_type: resourceType,
					use_filename: true,
					unique_filename: false,
					overwrite: false,
				},
				(error, result) => {
					if (error) {
						return reject(error);
					}
					resolve(result as UploadApiResponse);
				},
			);
			uploadStream.end(buffer);
		});
	}

	async uploadFiles(files: Express.Multer.File[], userId: string): Promise<UploadApiResponse[]> {
		return Promise.all(files.map(file => this.uploadFile(file, userId)));
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
			let resourceType: CloudinaryResourceType =
				FILE_TYPE_CONSTANTS.CLOUDINARY_RESOURCE_TYPES.IMAGE;
			if (url.includes('/video/')) {
				resourceType = FILE_TYPE_CONSTANTS.CLOUDINARY_RESOURCE_TYPES.VIDEO;
			} else if (url.includes('/raw/')) {
				resourceType = FILE_TYPE_CONSTANTS.CLOUDINARY_RESOURCE_TYPES.RAW;
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

function optimizeVideoWithFfmpeg(inputBuffer: Buffer): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		const inputStream = new PassThrough();
		inputStream.end(inputBuffer);

		const outputStream = new PassThrough();
		const chunks: Buffer[] = [];

		outputStream.on('data', chunk => chunks.push(chunk));
		outputStream.on('end', () => resolve(Buffer.concat(chunks)));
		outputStream.on('error', reject);

		ffmpeg(inputStream)
			.videoCodec('libx264')
			.audioCodec('aac')
			.size('?x720') // resize về 720p
			.outputOptions('-preset veryfast', '-crf 28', '-movflags +faststart') // nén video
			.format('mp4')
			.on('error', reject)
			.pipe(outputStream, { end: true });
	});
}
