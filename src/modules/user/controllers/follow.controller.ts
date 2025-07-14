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
	@ApiQuery({ name: 'userId', description: 'ID của người dùng', required: true })
	@ApiResponse({ status: 200, description: 'Danh sách followers', type: [UserBasicInfoDto] })
	async getFollowers(
		@Query('userId') userId: string,
		@Request() req,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<UserBasicInfoDto[]>> {
		const id = userId || req.user.id;
		const data = await this.userService.getFollowers(id, i18n);
		return {
			success: true,
			data,
			message: i18n.t('user.FOLLOWERS_RETRIEVED_SUCCESS'),
		};
	}

	@Version('1')
	@Get('following')
	@ApiOperation({ summary: 'Lấy danh sách đang theo dõi' })
	@ApiQuery({ name: 'userId', description: 'ID của người dùng', required: false })
	@ApiResponse({ status: 200, description: 'Danh sách following', type: [UserBasicInfoDto] })
	async getFollowing(
		@Query('userId') userId: string,
		@Request() req,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<UserBasicInfoDto[]>> {
		const id = userId || req.user.id;
		const data = await this.userService.getFollowing(id, i18n);
		return {
			success: true,
			data,
			message: i18n.t('user.FOLLOWING_RETRIEVED_SUCCESS'),
		};
	}
}
