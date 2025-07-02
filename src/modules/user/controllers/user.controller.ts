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
	Delete,
	UnauthorizedException,
	Query,
} from '@nestjs/common';
import {
	ApiBody,
	ApiOperation,
	ApiResponse,
	ApiTags,
	ApiParam,
	ApiConsumes,
	ApiOkResponse,
} from '@nestjs/swagger';
import { UserService } from '../providers/user.service';
import { ResponseEntity } from '@common/types';
import { ResponseProfileDto, UpdateProfileDto, FriendSimpleDto, UserBasicInfoDto } from '../dto';
import { I18n, I18nContext } from 'nestjs-i18n';
import { FileService } from '../../file/providers/file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadApiResponse } from 'cloudinary';
import { SportType, ActivityLevel } from '../enums/user.enum';
import { plainToInstance } from 'class-transformer';

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
	@Post('change-password')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Đổi mật khẩu' })
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				email: { type: 'string', description: 'Email của người dùng' },
				oldPassword: { type: 'string', description: 'Mật khẩu cũ' },
				newPassword: { type: 'string', description: 'Mật khẩu mới' },
			},
			required: ['email', 'oldPassword', 'newPassword'],
		},
	})
	@ApiResponse({ status: 200, description: 'Đổi mật khẩu thành công' })
	@ApiResponse({ status: 401, description: 'Mật khẩu cũ không đúng' })
	@ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
	async changePassword(
		@Body() body: { email: string; oldPassword: string; newPassword: string },
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<null>> {
		const { email, oldPassword, newPassword } = body;

		// Verify old password
		const isOldPasswordValid = await this.userService.verifyOldPassword(email, oldPassword, i18n);

		// Update to new password
		if (isOldPasswordValid) {
			await this.userService.updateNewPassword(email, newPassword, i18n);
		}

		return {
			success: true,
			message: i18n.t('user.PASSWORD_CHANGED_SUCCESS'),
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
	})
	async updateCurrentUserProfile(
		@Request() req,
		@Body() updateData: UpdateProfileDto,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<null>> {
		const userId = req.user.id;
		await this.userService.updateProfile(userId, updateData, i18n);

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

	@Public()
	@Version('1')
	@Get('all-sport')
	@ApiOperation({ summary: 'Lấy danh sách tất cả các môn thể thao' })
	@ApiOkResponse({
		description: 'Danh sách tất cả các môn thể thao',
		schema: {
			type: 'array',
			items: { type: 'string', enum: Object.values(SportType) },
		},
	})
	async getSports(@I18n() i18n: I18nContext): Promise<ResponseEntity<string[]>> {
		return {
			success: true,
			data: Object.values(SportType),
			message: i18n.t('user.SPORTS_RETRIEVED_SUCCESS'),
		};
	}

	@Version('1')
	@Put('skills')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Cập nhật trình độ kỹ năng cho từng môn thể thao' })
	@ApiBody({
		description: 'Skill levels',
		schema: {
			type: 'object',
			properties: {
				skillLevels: {
					type: 'object',
					additionalProperties: { type: 'string', enum: Object.values(ActivityLevel) },
				},
			},
		},
	})
	@ApiResponse({
		status: 200,
		description: 'Cập nhật skill levels thành công',
	})
	async updateSkillLevels(
		@Request() req,
		@Body('skillLevels') skillLevels: Record<string, ActivityLevel>,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<null>> {
		const userId = req.user.id;

		// Lấy các keys từ skillLevels để làm favoritesSports
		const favoritesSports = Object.keys(skillLevels) as SportType[];

		const skillLevelsMap = new Map(
			Object.entries(skillLevels).map(([k, v]) => [k as SportType, v as ActivityLevel]),
		);

		await this.userService.updateProfile(
			userId,
			{
				skillLevels: skillLevelsMap,
				favoritesSports: favoritesSports,
			},
			i18n,
		);
		return {
			success: true,
			message: i18n.t('user.SKILL_LEVELS_UPDATED_SUCCESS'),
		};
	}

	@Version('1')
	@Delete('favorite-sport/:sportType')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Xóa 1 môn thể thao khỏi danh sách yêu thích và skillLevels' })
	@ApiParam({
		name: 'sportType',
		enum: Object.values(SportType),
		description: 'Tên môn thể thao cần xóa',
	})
	@ApiResponse({
		status: 200,
		description: 'Xóa môn thể thao yêu thích thành công',
	})
	async removeFavoriteSport(
		@Request() req,
		@Param('sportType') sportType: string,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<null>> {
		const userId = req.user.id;
		const sport = sportType as SportType;

		// Lấy profile hiện tại
		const profile = await this.userService.getProfile(userId, i18n);
		// Xóa sportType khỏi favoritesSports
		const newFavorites = (profile.favoritesSports || []).filter(s => s !== sport);

		// Xóa sportType khỏi skillLevels
		const newSkillLevels = new Map(
			Object.entries(profile.skillLevels || {}).map(([k, v]) => [
				k as SportType,
				v as ActivityLevel,
			]),
		);
		newSkillLevels.delete(sport);

		await this.userService.updateProfile(
			userId,
			{
				favoritesSports: newFavorites,
				skillLevels: newSkillLevels,
			},
			i18n,
		);
		return {
			success: true,
			message: i18n.t('user.FAVORITE_SPORT_REMOVED_SUCCESS'),
		};
	}

	@Version('1')
	@Get('friends/search')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({
		summary: 'Tìm kiếm bạn bè theo tên (fullname, không phân biệt hoa thường, có phân trang)',
	})
	@ApiOkResponse({
		description: 'Danh sách bạn bè phù hợp',
		schema: {
			type: 'object',
			properties: {
				success: { type: 'boolean' },
				data: {
					type: 'array',
					items: { $ref: '#/components/schemas/FriendSimpleDto' },
				},
				message: { type: 'string' },
			},
		},
	})
	async getFriendsByName(
		@Request() req,
		@I18n() i18n: I18nContext,
		@Query('key') key: string,
		@Query('page') page: number = 1,
		@Query('limit') limit: number = 10,
	): Promise<ResponseEntity<FriendSimpleDto[]>> {
		const userId = req.user.id;
		const friends = await this.userService.getFriendsByFullName(userId, key, page, limit);
		const data = plainToInstance(FriendSimpleDto, friends, { excludeExtraneousValues: true });
		return {
			success: true,
			data,
			message: i18n.t('user.FRIENDS_RETRIEVED_SUCCESS'),
		};
	}

	@Version('1')
	@Get(':userId/basic-info')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Lấy thông tin cơ bản của người dùng theo ID' })
	@ApiParam({ name: 'userId', description: 'ID của người dùng' })
	@ApiResponse({
		status: 200,
		description: 'Lấy thông tin cơ bản thành công',
		type: UserBasicInfoDto,
	})
	@ApiResponse({
		status: 404,
		description: 'Không tìm thấy người dùng',
	})
	async getUserBasicInfo(
		@Param('userId') userId: string,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<UserBasicInfoDto>> {
		const basicInfo = await this.userService.getBasicInfo(userId, i18n);

		return {
			success: true,
			data: basicInfo,
			message: i18n.t('user.BASIC_INFO_RETRIEVED_SUCCESS'),
		};
	}
}
