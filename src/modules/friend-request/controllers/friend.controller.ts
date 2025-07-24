import {
	Controller,
	Delete,
	Get,
	Param,
	Query,
	Request,
	UseGuards,
	Version,
	BadRequestException,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { RolesGuard } from '@common/guards';
import { Roles } from '@common/decorators';
import { Role } from '@common/enum';
import { ResponseEntity } from '@common/types';
import { FriendRequestService } from '../providers/friend-request.service';
import { PaginatedFriendsResponseDto, MutualFriendsResponseDto } from '@modules/friend-request/dto';

@ApiTags('Friends')
@Controller('friends')
export class FriendsController {
	constructor(private readonly friendRequestService: FriendRequestService) {}

	@Version('1')
	@Get()
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Lấy danh sách bạn bè của người dùng hiện tại' })
	@ApiQuery({
		name: 'page',
		required: false,
		type: Number,
		description: 'Số trang (mặc định: 1)',
		example: 1,
	})
	@ApiQuery({
		name: 'limit',
		required: false,
		type: Number,
		description: 'Số lượng bạn bè trên mỗi trang (mặc định: 10)',
		example: 10,
	})
	@ApiQuery({
		name: 'search',
		required: false,
		type: String,
		description: 'Tìm kiếm bạn bè theo tên hoặc email',
		example: 'Nguyen Van',
	})
	@ApiResponse({
		status: 200,
		description: 'Lấy danh sách bạn bè thành công',
		type: PaginatedFriendsResponseDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Không có quyền truy cập',
	})
	async getFriendsList(
		@Request() req,
		@I18n() i18n: I18nContext,
		@Query('page') page: number = 1,
		@Query('limit') limit: number = 10,
		@Query('search') search?: string,
	): Promise<ResponseEntity<PaginatedFriendsResponseDto>> {
		const result = await this.friendRequestService.getFriendsList(
			req.user.id,
			i18n,
			page,
			limit,
			search,
		);

		return {
			success: true,
			data: result,
			message: i18n.t('friend-request.FRIENDS_RETRIEVED_SUCCESS'),
		};
	}

	@Version('1')
	@Delete(':friendId')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Xóa bạn bè' })
	@ApiParam({
		name: 'friendId',
		description: 'ID của người bạn cần xóa',
		example: '507f1f77bcf86cd799439011',
	})
	@ApiResponse({
		status: 200,
		description: 'Xóa bạn bè thành công',
	})
	@ApiResponse({
		status: 400,
		description: 'Dữ liệu không hợp lệ hoặc không phải bạn bè',
	})
	@ApiResponse({
		status: 401,
		description: 'Không có quyền truy cập',
	})
	@ApiResponse({
		status: 404,
		description: 'Không tìm thấy người dùng',
	})
	async removeFriend(
		@Request() req,
		@Param('friendId') friendId: string,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<null>> {
		try {
			await this.friendRequestService.removeFriend(req.user.id, friendId, i18n);

			return {
				success: true,
				message: i18n.t('friend-request.FRIEND_REMOVED_SUCCESS'),
			};
		} catch (error) {
			if (error instanceof BadRequestException) {
				throw error;
			}
			throw new BadRequestException(i18n.t('friend-request.FRIEND_REMOVED_FAILED'));
		}
	}

	@Version('1')
	@Get(':userId/mutual')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({
		summary:
			'Lấy danh sách bạn bè chung với người dùng khác (người này có thể chưa phải là bạn bè)',
	})
	@ApiParam({
		name: 'userId',
		description: 'ID của người dùng cần kiểm tra bạn bè chung',
		example: '507f1f77bcf86cd799439011',
	})
	@ApiQuery({
		name: 'page',
		required: false,
		type: Number,
		description: 'Số trang (mặc định: 1)',
		example: 1,
	})
	@ApiQuery({
		name: 'limit',
		required: false,
		type: Number,
		description: 'Số lượng bạn bè chung trên mỗi trang (mặc định: 10)',
		example: 10,
	})
	@ApiResponse({
		status: 200,
		description: 'Lấy danh sách bạn bè chung thành công',
		type: MutualFriendsResponseDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Dữ liệu không hợp lệ',
	})
	@ApiResponse({
		status: 401,
		description: 'Không có quyền truy cập',
	})
	@ApiResponse({
		status: 404,
		description: 'Không tìm thấy người dùng',
	})
	async getMutualFriends(
		@Request() req,
		@Param('userId') userId: string,
		@I18n() i18n: I18nContext,
		@Query('page') page: number = 1,
		@Query('limit') limit: number = 10,
	): Promise<ResponseEntity<MutualFriendsResponseDto>> {
		try {
			const result = await this.friendRequestService.getMutualFriends(
				req.user.id,
				userId,
				page,
				limit,
				i18n,
			);

			return {
				success: true,
				data: result,
				message: i18n.t('friend-request.MUTUAL_FRIENDS_RETRIEVED_SUCCESS'),
			};
		} catch (error) {
			if (error instanceof BadRequestException) {
				throw error;
			}
			throw new BadRequestException(i18n.t('friend-request.MUTUAL_FRIENDS_RETRIEVED_FAILED'));
		}
	}
}
