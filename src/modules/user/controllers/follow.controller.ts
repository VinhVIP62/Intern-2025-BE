import {
	Controller,
	Post,
	Delete,
	Get,
	Param,
	Request,
	UseGuards,
	Version,
	Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UserService } from '../providers/user.service';
import { RolesGuard } from '@common/guards';
import { Roles } from '@common/decorators';
import { Role } from '@common/enum';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ResponseEntity } from '@common/types';
import { UserBasicInfoDto } from '../dto/user-basic-info.dto';
import { PaginatedUserBasicInfoResponseDto } from '../dto/user-response.dto';

@ApiTags('User Follow')
@Controller('users')
export class FollowController {
	constructor(private readonly userService: UserService) {}

	@Version('1')
	@Post(':userId/follow')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Theo dõi người dùng' })
	@ApiParam({ name: 'userId', description: 'ID của người dùng cần theo dõi' })
	@ApiResponse({ status: 200, description: 'Theo dõi thành công' })
	async followUser(
		@Request() req,
		@Param('userId') userId: string,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<null>> {
		await this.userService.followUser(req.user.id, userId, i18n);
		return {
			success: true,
			message: i18n.t('user.FOLLOW_SUCCESS'),
		};
	}

	@Version('1')
	@Delete(':userId/follow')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Bỏ theo dõi người dùng' })
	@ApiParam({ name: 'userId', description: 'ID của người dùng cần bỏ theo dõi' })
	@ApiResponse({ status: 200, description: 'Bỏ theo dõi thành công' })
	async unfollowUser(
		@Request() req,
		@Param('userId') userId: string,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<null>> {
		await this.userService.unfollowUser(req.user.id, userId, i18n);
		return {
			success: true,
			message: i18n.t('user.UNFOLLOW_SUCCESS'),
		};
	}

	@Version('1')
	@Get('followers')
	@ApiOperation({ summary: 'Lấy danh sách người theo dõi' })
	@ApiQuery({
		name: 'userId',
		description: 'ID của người dùng (default = current user)',
		required: true,
	})
	@ApiQuery({
		name: 'key',
		description:
			'Từ khóa tìm kiếm theo tên (nếu không truyền thì tương đương với get toàn bộ followers)',
		required: false,
	})
	@ApiQuery({ name: 'page', description: 'Trang', required: false, type: Number, example: 1 })
	@ApiQuery({
		name: 'limit',
		description: 'Số lượng mỗi trang',
		required: false,
		type: Number,
		example: 10,
	})
	@ApiResponse({
		status: 200,
		description: 'Danh sách followers',
		type: PaginatedUserBasicInfoResponseDto,
	})
	async getFollowers(
		@Query('userId') userId: string,
		@Query('key') key: string,
		@Query('page') page = 1,
		@Query('limit') limit = 10,
		@Request() req,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<PaginatedUserBasicInfoResponseDto>> {
		const id = userId || req.user.id;
		const followers = await this.userService.getFollowers(id, key, page, limit, i18n);
		return {
			success: true,
			message: i18n.t('user.GET_FOLLOWERS_SUCCESS'),
			data: followers,
		};
	}

	@Version('1')
	@Get('following')
	@ApiOperation({ summary: 'Lấy danh sách đang theo dõi' })
	@ApiQuery({
		name: 'userId',
		description: 'ID của người dùng (default = current user)',
		required: false,
	})
	@ApiQuery({
		name: 'key',
		description:
			'Từ khóa tìm kiếm theo tên (nếu không truyền thì tương đương với get toàn bộ following)',
		required: false,
	})
	@ApiQuery({ name: 'page', description: 'Trang', required: false, type: Number, example: 1 })
	@ApiQuery({
		name: 'limit',
		description: 'Số lượng mỗi trang',
		required: false,
		type: Number,
		example: 10,
	})
	@ApiResponse({
		status: 200,
		description: 'Danh sách following',
		type: PaginatedUserBasicInfoResponseDto,
	})
	async getFollowing(
		@Query('userId') userId: string,
		@Query('key') key: string,
		@Query('page') page = 1,
		@Query('limit') limit = 10,
		@Request() req,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<PaginatedUserBasicInfoResponseDto>> {
		const id = userId || req.user.id;
		const following = await this.userService.getFollowing(id, key, page, limit, i18n);
		return {
			success: true,
			message: i18n.t('user.GET_FOLLOWING_SUCCESS'),
			data: following,
		};
	}

	@Version('1')
	@Delete('followers/:followerId')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Xóa follower khỏi tài khoản của bạn' })
	@ApiParam({ name: 'followerId', description: 'ID của follower cần xóa' })
	@ApiResponse({ status: 200, description: 'Xóa follower thành công' })
	async removeFollower(
		@Request() req,
		@Param('followerId') followerId: string,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<null>> {
		await this.userService.removeFollower(req.user.id, followerId, i18n);
		return {
			success: true,
			message: i18n.t('user.REMOVE_FOLLOWER_SUCCESS'),
		};
	}
}
