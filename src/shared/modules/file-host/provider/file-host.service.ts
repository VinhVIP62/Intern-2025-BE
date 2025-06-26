import { HttpService } from '@nestjs/axios';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';
import { ConfigService } from '@nestjs/config';
import { IEnvVars } from '@configs/config';

export interface FileUploadResponse {
	fileId: string;
	name: string;
	filePath: string;
	url: string;
	size: number;
	/** Send tags in responseFields in API request to get the value of this field. */
	tags?: string[] | null;

	versionInfo: {
		id: string;
		name: string;
	};
	/** Send isPrivateFile in responseFields in API request to get the value of this field. */
	isPrivateFile?: boolean;
	/** Send isPublished in responseFields in API request to get the value of this field. */
	isPublished?: boolean;

	fileType: 'image' | 'non-image';
}

export interface ImageUploadResponse extends FileUploadResponse {
	thumbnailUrl: string;
	height: number;
	width: number;
}

export interface VideoUploadResponse extends FileUploadResponse {
	bitRate: number;
	/** Duration in seconds */
	duration: number;
	audioCodec: string;
	videoCodec: string;
}

@Injectable()
export class FileHostService {
	constructor(
		private readonly httpService: HttpService,
		private readonly configService: ConfigService<IEnvVars>,
	) {}

	/** Returns URL to the image */
	async image2Url(file: Express.Multer.File): Promise<string | null> {
		const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];

		if (!allowedMimeTypes.includes(file.mimetype)) {
			throw new UnprocessableEntityException(`Allowed file types: ${allowedMimeTypes.join(', ')}`);
		}

		// init formdata
		const formData = new FormData();
		formData.append('file', file.buffer, {
			filename: file.originalname,
			contentType: file.mimetype,
		});
		formData.append('fileName', file.originalname);

		// axios request
		const { data } = await firstValueFrom(
			this.httpService.post<FileUploadResponse>('/api/v1/files/upload', formData, {
				headers: {
					Authorization: `Basic ${this.configService.get('imgKitKey')}`,
					'Content-Type': 'multipart/form-data',
				},
			}),
		);

		return data.url;
	}
}
