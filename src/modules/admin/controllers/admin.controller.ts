import { Roles } from '@common/decorators';
import { Response } from '@common/decorators/response.decorator';
import { Role } from '@common/enum/user/roles.enum';
import { RolesGuard } from '@common/guards';
import { Controller, Query, UseGuards, Post, Body } from '@nestjs/common';
import { Get } from '@nestjs/common';
import { AdminService } from '@modules/admin/providers/admin.service';
import { ResponseEntity } from '@common/types';
import { ListUserIdDto } from '../dto/request/list.userId.dto';

@Controller({ version: '1' })
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
	constructor(private readonly adminService: AdminService) {}

	@Get('report/users')
	@Response()
	async getUserReport(
		@Query('limit') limit: number = 10,
		@Query('page') page: number = 0,
	): Promise<ResponseEntity<any>> {
		const res = await this.adminService.getUserSortByReportCount(limit, page);
		return {
			success: true,
			data: res,
		};
	}

	@Get('report/posts')
	@Response()
	async getPostReport(
		@Query('limit') limit: number = 10,
		@Query('page') page: number = 0,
	): Promise<ResponseEntity<any>> {
		const res = await this.adminService.getPostSortByReportCount(limit, page);
		return {
			success: true,
			data: res,
		};
	}

	@Get('deleted/posts')
	@Response()
	async getDeletedPosts(
		@Query('limit') limit: number = 10,
		@Query('page') page: number = 0,
	): Promise<ResponseEntity<any>> {
		const res = await this.adminService.getDeletedPosts(limit, page);
		return {
			success: true,
			data: res,
		};
	}

	@Post('ban/user')
	@Response()
	async banUser(@Body() listUserIdDto: ListUserIdDto): Promise<ResponseEntity<any>> {
		const userIds = listUserIdDto.userIds;
		if (!userIds || userIds.length === 0) {
			return {
				success: false,
				error: 'No user IDs provided',
				data: null,
			};
		}
		const res = await this.adminService.banUser(userIds);
		return {
			success: res.success,
			data: res,
		};
	}

	@Post('unban/user')
	@Response()
	async unbanUser(@Body() listUserIdDto: ListUserIdDto): Promise<ResponseEntity<any>> {
		const userIds = listUserIdDto.userIds;
		if (!userIds || userIds.length === 0) {
			return {
				success: false,
				error: 'No user IDs provided',
				data: null,
			};
		}
		const res = await this.adminService.unbanUser(userIds);
		return {
			success: res.success,
			data: res,
		};
	}
}
