import { Controller, Post, Delete, Get, Request, Param, UseGuards, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam , ApiBearerAuth} from '@nestjs/swagger';
import { UserService } from '@modules/user/providers/user.service';
import { RolesGuard } from '@common/guards';
import { Roles } from '@common/decorators';
import { Role } from '@common/enum';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ResponseEntity } from '@common/types';
import { UserBasicInfoDto } from '@modules/user/dto/request/user-basic-info.dto';

@ApiTags('User Management')
@Controller('users')
export class UserManagementController {
	constructor(private readonly userService: UserService) {}

	@Version('1')
	@Post(':userId/block')
	@UseGuards(RolesGuard)
	@ApiBearerAuth()
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Chặn người dùng' })
	@ApiParam({ name: 'userId', description: 'ID của người dùng cần chặn' })
	@ApiResponse({ status: 200, description: 'Chặn thành công' })
	async blockUser(
		@Request() req,
		@Param('userId') userId: string,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<null>> {
		await this.userService.blockUser(req.user.id, userId, i18n);
		return {
			success: true,
			message: i18n.t('user.BLOCK_SUCCESS'),
		};
	}

	@Version('1')
	@Delete(':userId/block')
	@UseGuards(RolesGuard)
	@ApiBearerAuth()
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Bỏ chặn người dùng' })
	@ApiParam({ name: 'userId', description: 'ID của người dùng cần bỏ chặn' })
	@ApiResponse({ status: 200, description: 'Bỏ chặn thành công' })
	async unblockUser(
		@Request() req,
		@Param('userId') userId: string,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<null>> {
		await this.userService.unblockUser(req.user.id, userId, i18n);
		return {
			success: true,
			message: i18n.t('user.UNBLOCK_SUCCESS'),
		};
	}

	@Version('1')
	@Get('blocked')
	@UseGuards(RolesGuard)
	@ApiBearerAuth()
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Lấy danh sách người dùng đã chặn' })
	@ApiResponse({ status: 200, description: 'Danh sách đã chặn', type: [UserBasicInfoDto] })
	async getBlockedUsers(
		@Request() req,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<UserBasicInfoDto[]>> {
		const data = await this.userService.getBlockedUsers(req.user.id, i18n);
		return {
			success: true,
			data,
			message: i18n.t('user.BLOCKED_USERS_RETRIEVED_SUCCESS'),
		};
	}
}
