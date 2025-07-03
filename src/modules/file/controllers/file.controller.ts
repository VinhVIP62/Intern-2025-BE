import {
	BadRequestException,
	Controller,
	Post,
	Delete,
	Body,
	UploadedFile,
	UploadedFiles,
	UseGuards,
	UseInterceptors,
	Version,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FileService } from '../providers/file.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Role } from '@common/enum/roles.enum';
import { Roles } from '@common/decorators/roles.decorator';
import { ApiBody, ApiProperty, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { ApiOperation } from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator';
import { ResponseEntity } from '@common/types';
import { UploadApiResponse, DeleteApiResponse } from 'cloudinary';
import { I18n, I18nContext } from 'nestjs-i18n';
import { DeleteFilesDto } from '../file.dto';

@Controller('file')
export class FileController {
	constructor(private readonly fileService: FileService) {}

	@Version('1')
	@Post('upload')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Upload file' })
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		description: 'File upload',
		schema: {
			type: 'object',
			properties: {
				file: {
					type: 'string',
					format: 'binary',
				},
			},
		},
	})
	@ApiResponse({
		status: 200,
		description: 'Upload file successfully',
		schema: {
			example: {
				success: true,
				data: {
					asset_id: 'some-asset-id',
					public_id: 'some-public-id',
					url: 'https://res.cloudinary.com/...',
					// ...other UploadApiResponse fields
				},
				message: 'File uploaded successfully',
			},
		},
	})
	@UseInterceptors(FileInterceptor('file'))
	async uploadFile(
		@UploadedFile() file: Express.Multer.File,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<UploadApiResponse>> {
		try {
			const result = await this.fileService.uploadFile(file);
			return {
				success: true,
				data: result,
				message: i18n.t('common.FILE_UPLOAD_SUCCESS'),
			};
		} catch (error) {
			console.error('Upload error:', error);
			throw new BadRequestException(i18n.t('common.FILE_UPLOAD_ERROR'));
		}
	}

	@Version('1')
	@Post('upload-multiple')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Upload multiple files' })
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		description: 'Multiple file upload',
		schema: {
			type: 'object',
			properties: {
				files: {
					type: 'array',
					items: {
						type: 'string',
						format: 'binary',
					},
				},
			},
		},
	})
	@ApiResponse({
		status: 200,
		description: 'Upload multiple files successfully',
		schema: {
			example: {
				success: true,
				data: [
					{
						asset_id: 'some-asset-id',
						public_id: 'some-public-id',
						url: 'https://res.cloudinary.com/...',
						// ...other UploadApiResponse fields
					},
				],
				message: 'Files uploaded successfully',
			},
		},
	})
	@UseInterceptors(FilesInterceptor('files'))
	async uploadMultipleFiles(
		@UploadedFiles() files: Express.Multer.File[],
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<UploadApiResponse[]>> {
		try {
			const result = await this.fileService.uploadFiles(files);
			return {
				success: true,
				data: result,
				message: i18n.t('common.FILE_UPLOAD_SUCCESS'),
			};
		} catch (error) {
			console.error('Upload error:', error);
			throw new BadRequestException(i18n.t('common.FILE_UPLOAD_ERROR'));
		}
	}

	@Version('1')
	@Delete('delete-multiple')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Delete multiple files by file URLs' })
	@ApiBody({
		description: 'Delete multiple files by URLs',
		type: DeleteFilesDto,
	})
	@ApiResponse({
		status: 200,
		description: 'Delete multiple files successfully',
		schema: {
			example: {
				success: true,
				data: [
					{
						result: 'ok',
						deleted: {
							'folder/filename': 'deleted',
						},
					},
				],
				message: 'Files deleted successfully',
			},
		},
	})
	async deleteMultipleFiles(
		@Body() deleteFilesDto: DeleteFilesDto,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<DeleteApiResponse[]>> {
		try {
			if (!deleteFilesDto.urls || deleteFilesDto.urls.length === 0) {
				throw new BadRequestException(i18n.t('common.NO_URLS_PROVIDED'));
			}

			const result = await this.fileService.deleteFiles(deleteFilesDto.urls);
			return {
				success: true,
				data: result,
				message: i18n.t('common.FILE_DELETE_SUCCESS'),
			};
		} catch (error) {
			console.error('Delete error:', error);
			throw new BadRequestException(i18n.t('common.FILE_DELETE_ERROR'));
		}
	}
}
