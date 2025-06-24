import { Public, Roles } from '@common/decorators';
import { Role } from '@common/enum';
import { RolesGuard } from '@common/guards';
import {
	Body,
	Controller,
	Get,
	Post,
	Put,
	UseGuards,
	Version,
	Param,
	Request,
	UploadedFile,
	UseInterceptors,
	BadRequestException,
} from '@nestjs/common';
import {
	ApiBody,
	ApiOperation,
	ApiResponse,
	ApiTags,
	ApiParam,
	ApiConsumes,
} from '@nestjs/swagger';
import { UserService } from '../providers/user.service';
import { ResponseEntity } from '@common/types';
import { ResponseProfileDto, UpdateProfileDto } from '../dto';
import { I18n, I18nContext } from 'nestjs-i18n';
import { FileService } from '../../file/providers/file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadApiResponse } from 'cloudinary';

@ApiTags('User')
@Controller('user')
export class UserController {
	constructor(
		private readonly userService: UserService,
		private readonly fileService: FileService,
	) {}

	@Public()
	@Version('1')
	@Post('new-password')
	@ApiOperation({ summary: 'Tạo mật khẩu mới' })
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				email: { type: 'string' },
				newPassword: { type: 'string' },
			},
		},
	})
	@ApiResponse({ status: 200, description: 'Tạo mật khẩu mới thành công' })
	async updateNewPassword(
		@Body() body: { email: string; newPassword: string },
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<null>> {
		const { email, newPassword } = body;
		await this.userService.updateNewPassword(email, newPassword, i18n);

		return {
			success: true,
			message: i18n.t('user.PASSWORD_UPDATED_SUCCESS'),
		};
	}

	@Version('1')
	@Get('profile')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Lấy thông tin profile của người dùng hiện tại' })
	@ApiResponse({
		status: 200,
		description: 'Lấy thông tin profile thành công',
		type: ResponseProfileDto,
	})
	async getCurrentUserProfile(
		@Request() req,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<ResponseProfileDto>> {
		const userId = req.user.id;
		const profile = await this.userService.getProfile(userId, i18n);

		return {
			success: true,
			data: profile,
			message: i18n.t('user.PROFILE_RETRIEVED_SUCCESS'),
		};
	}

	@Version('1')
	@Get(':userId/profile')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Lấy thông tin profile của người dùng theo ID' })
	@ApiParam({ name: 'userId', description: 'ID của người dùng' })
	@ApiResponse({
		status: 200,
		description: 'Lấy thông tin profile thành công',
		type: ResponseProfileDto,
	})
	async getUserProfile(
		@Param('userId') userId: string,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<ResponseProfileDto>> {
		const profile = await this.userService.getProfile(userId, i18n);

		return {
			success: true,
			data: profile,
			message: i18n.t('user.PROFILE_RETRIEVED_SUCCESS'),
		};
	}

	@Version('1')
	@Put('profile')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Cập nhật thông tin profile của người dùng hiện tại' })
	@ApiBody({ type: UpdateProfileDto })
	@ApiResponse({
		status: 200,
		description: 'Cập nhật profile thành công',
		type: String,
	})
	async updateCurrentUserProfile(
		@Request() req,
		@Body() updateData: UpdateProfileDto,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<null>> {
		const userId = req.user.id;
		const updatedProfile = await this.userService.updateProfile(userId, updateData, i18n);

		return {
			success: true,
			message: i18n.t('user.PROFILE_UPDATED_SUCCESS'),
		};
	}

	@Version('1')
	@Post('avatar-image')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@UseInterceptors(FileInterceptor('file'))
	@ApiOperation({ summary: 'Upload avatar image for current user' })
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		description: 'Avatar image upload',
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
		description: 'Upload avatar image successfully',
		schema: {
			example: {
				success: true,
				data: {
					asset_id: 'some-asset-id',
					public_id: 'some-public-id',
					url: 'https://res.cloudinary.com/...',
					// ...other UploadApiResponse fields
				},
				message: 'Tải lên tệp tin thành công',
			},
		},
	})
	async uploadAvatarImage(
		@Request() req,
		@UploadedFile() file: Express.Multer.File,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<UploadApiResponse>> {
		try {
			const result = await this.fileService.uploadFile(file);
			await this.userService.update(req.user.id, { avatar: result.secure_url });
			return {
				success: true,
				data: result,
				message: i18n.t('common.FILE_UPLOAD_SUCCESS'),
			};
		} catch (error) {
			console.error('Upload avatar error:', error);
			throw new BadRequestException(i18n.t('common.FILE_UPLOAD_ERROR'));
		}
	}

	@Version('1')
	@Post('cover-image')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@UseInterceptors(FileInterceptor('file'))
	@ApiOperation({ summary: 'Upload cover image for current user' })
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		description: 'Cover image upload',
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
		description: 'Upload cover image successfully',
		schema: {
			example: {
				success: true,
				data: {
					asset_id: 'some-asset-id',
					public_id: 'some-public-id',
					url: 'https://res.cloudinary.com/...',
					// ...other UploadApiResponse fields
				},
				message: 'Tải lên tệp tin thành công',
			},
		},
	})
	async uploadCoverImage(
		@Request() req,
		@UploadedFile() file: Express.Multer.File,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<UploadApiResponse>> {
		try {
			const result = await this.fileService.uploadFile(file);
			await this.userService.update(req.user.id, { coverImage: result.secure_url });
			return {
				success: true,
				data: result,
				message: i18n.t('common.FILE_UPLOAD_SUCCESS'),
			};
		} catch (error) {
			console.error('Upload cover image error:', error);
			throw new BadRequestException(i18n.t('common.FILE_UPLOAD_ERROR'));
		}
	}
}
