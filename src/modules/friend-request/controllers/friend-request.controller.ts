import {
	Controller,
	Get,
	Param,
	Query,
	Version,
	Post,
	Body,
	Request,
	UseGuards,
	BadRequestException,
	Put,
	NotFoundException,
	ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { FriendRequestService } from '../providers/friend-request.service';
import { ResponseEntity } from '@common/types';
import {
	CreateFriendRequestDto,
	FriendRequestResponseDto,
	PaginatedFriendRequestsResponseDto,
	FriendshipStatusResponseDto,
} from '../dto/friend-request.dto';
import { I18n, I18nContext } from 'nestjs-i18n';
import { RolesGuard } from '@common/guards';
import { Roles } from '@common/decorators';
import { Role } from '@common/enum';

@ApiTags('Friend Request')
@Controller('friends/requests')
export class FriendRequestController {
	constructor(private readonly friendRequestService: FriendRequestService) {}

	@Version('1')
	@Post()
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Gửi lời mời kết bạn' })
	@ApiBody({ type: CreateFriendRequestDto })
	@ApiResponse({
		status: 201,
		description: 'Gửi lời mời kết bạn thành công',
		type: FriendRequestResponseDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Dữ liệu không hợp lệ hoặc lời mời đã tồn tại',
	})
	@ApiResponse({
		status: 401,
		description: 'Không có quyền truy cập',
	})
	async createFriendRequest(
		@Request() req,
		@Body() createFriendRequestDto: CreateFriendRequestDto,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<FriendRequestResponseDto>> {
		try {
			const friendRequest = await this.friendRequestService.createFriendRequest(
				createFriendRequestDto,
				req.user.id,
				i18n,
			);

			return {
				success: true,
				data: friendRequest,
				message: i18n.t('friend-request.REQUEST_SENT_SUCCESS'),
			};
		} catch (error) {
			if (error instanceof BadRequestException) {
				throw error;
			}
			throw new BadRequestException(i18n.t('friend-request.REQUEST_SENT_FAILED'));
		}
	}

	@Version('1')
	@Get()
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Lấy danh sách lời mời kết bạn' })
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
		description: 'Số lượng lời mời trên mỗi trang (mặc định: 10)',
		example: 10,
	})
	@ApiQuery({
		name: 'type',
		required: false,
		enum: ['sent', 'received'],
		description: 'Loại lời mời (sent: đã gửi, received: đã nhận), default: received',
		example: 'received',
	})
	@ApiResponse({
		status: 200,
		description: 'Lấy danh sách lời mời kết bạn thành công',
		type: PaginatedFriendRequestsResponseDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Không có quyền truy cập',
	})
	async getFriendRequests(
		@Request() req,
		@I18n() i18n: I18nContext,
		@Query('page') page: number = 1,
		@Query('limit') limit: number = 10,
		@Query('type') type: 'sent' | 'received' = 'received',
	): Promise<ResponseEntity<PaginatedFriendRequestsResponseDto>> {
		const result = await this.friendRequestService.getFriendRequests(
			i18n,
			page,
			limit,
			req.user.id,
			type,
		);

		return {
			success: true,
			data: result,
			message: i18n.t('friend-request.REQUESTS_RETRIEVED_SUCCESS'),
		};
	}

	@Version('1')
	@Get('check-friendship')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({
		summary: 'Kiểm tra trạng thái bạn bè giữa người dùng hiện tại và người dùng khác',
	})
	@ApiQuery({
		name: 'userId',
		required: true,
		type: String,
		description: 'ID của người dùng cần kiểm tra',
		example: '507f1f77bcf86cd799439011',
	})
	@ApiResponse({
		status: 200,
		description: 'Kiểm tra trạng thái bạn bè thành công',
		type: FriendshipStatusResponseDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Dữ liệu không hợp lệ',
	})
	@ApiResponse({
		status: 401,
		description: 'Không có quyền truy cập',
	})
	async checkFriendshipStatus(
		@Request() req,
		@Query('userId') userId: string,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<FriendshipStatusResponseDto>> {
		try {
			const result = await this.friendRequestService.checkFriendshipStatus(
				req.user.id,
				userId,
				i18n,
			);

			return {
				success: true,
				data: result,
				message: i18n.t('friend-request.FRIENDSHIP_STATUS_RETRIEVED_SUCCESS'),
			};
		} catch (error) {
			if (error instanceof BadRequestException) {
				throw error;
			}
			throw new BadRequestException(i18n.t('friend-request.FRIENDSHIP_STATUS_RETRIEVED_FAILED'));
		}
	}

	@Version('1')
	@Put(':requestId/accept')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Chấp nhận lời mời kết bạn' })
	@ApiParam({
		name: 'requestId',
		description: 'ID của lời mời kết bạn',
		example: '507f1f77bcf86cd799439011',
	})
	@ApiResponse({
		status: 200,
		description: 'Chấp nhận lời mời kết bạn thành công',
		type: FriendRequestResponseDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Dữ liệu không hợp lệ hoặc lời mời không ở trạng thái pending',
	})
	@ApiResponse({
		status: 401,
		description: 'Không có quyền truy cập',
	})
	@ApiResponse({
		status: 403,
		description: 'Không có quyền chấp nhận lời mời này',
	})
	@ApiResponse({
		status: 404,
		description: 'Không tìm thấy lời mời kết bạn',
	})
	async acceptFriendRequest(
		@Request() req,
		@Param('requestId') requestId: string,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<null>> {
		try {
			await this.friendRequestService.acceptFriendRequest(requestId, req.user.id, i18n);

			return {
				success: true,
				message: i18n.t('friend-request.REQUEST_ACCEPTED_SUCCESS'),
			};
		} catch (error) {
			if (error instanceof BadRequestException) {
				throw error;
			}
			throw new BadRequestException(i18n.t('friend-request.REQUEST_ACCEPTED_FAILED'));
		}
	}

	@Version('1')
	@Put(':requestId/decline')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Từ chối lời mời kết bạn' })
	@ApiParam({
		name: 'requestId',
		description: 'ID của lời mời kết bạn',
		example: '507f1f77bcf86cd799439011',
	})
	@ApiResponse({
		status: 200,
		description: 'Từ chối lời mời kết bạn thành công',
		type: FriendRequestResponseDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Dữ liệu không hợp lệ hoặc lời mời không ở trạng thái pending',
	})
	@ApiResponse({
		status: 401,
		description: 'Không có quyền truy cập',
	})
	@ApiResponse({
		status: 403,
		description: 'Không có quyền từ chối lời mời này',
	})
	@ApiResponse({
		status: 404,
		description: 'Không tìm thấy lời mời kết bạn',
	})
	async declineFriendRequest(
		@Request() req,
		@Param('requestId') requestId: string,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<null>> {
		try {
			await this.friendRequestService.declineFriendRequest(requestId, req.user.id, i18n);

			return {
				success: true,
				message: i18n.t('friend-request.REQUEST_DECLINED_SUCCESS'),
			};
		} catch (error) {
			if (error instanceof BadRequestException) {
				throw error;
			}
			throw new BadRequestException(i18n.t('friend-request.REQUEST_DECLINED_FAILED'));
		}
	}

	@Version('1')
	@Put(':requestId/message')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Chỉnh sửa lời nhắn của lời mời kết bạn (chỉ sender, khi pending)' })
	@ApiParam({
		name: 'requestId',
		description: 'ID của lời mời kết bạn',
		example: '507f1f77bcf86cd799439011',
	})
	@ApiBody({
		schema: {
			properties: { message: { type: 'string', example: 'Xin chào, mình muốn kết bạn!' } },
		},
	})
	@ApiResponse({
		status: 200,
		description: 'Chỉnh sửa lời nhắn thành công',
		type: FriendRequestResponseDto,
	})
	@ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ hoặc không thể chỉnh sửa' })
	@ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
	@ApiResponse({ status: 403, description: 'Không có quyền chỉnh sửa lời mời này' })
	@ApiResponse({ status: 404, description: 'Không tìm thấy lời mời kết bạn' })
	async editFriendRequestMessage(
		@Request() req,
		@Param('requestId') requestId: string,
		@Body('message') message: string,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<FriendRequestResponseDto>> {
		try {
			const updated = await this.friendRequestService.editFriendRequestMessage(
				requestId,
				req.user.id,
				message,
				i18n,
			);
			return {
				success: true,
				data: updated,
				message: i18n.t('friend-request.MESSAGE_EDITED_SUCCESS'),
			};
		} catch (error) {
			// console.error('Edit friend request message error:', error);
			if (error instanceof BadRequestException) throw error;
			if (error instanceof NotFoundException) throw new NotFoundException(error.message);
			if (error instanceof ForbiddenException) throw new ForbiddenException(error.message);
			throw new BadRequestException(i18n.t('friend-request.MESSAGE_EDITED_FAILED'));
		}
	}

	@Version('1')
	@Put(':requestId/cancel')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Hủy lời mời kết bạn (chỉ sender, khi pending)' })
	@ApiParam({
		name: 'requestId',
		description: 'ID của lời mời kết bạn',
		example: '507f1f77bcf86cd799439011',
	})
	@ApiResponse({
		status: 200,
		description: 'Hủy lời mời kết bạn thành công',
		schema: { example: { success: true, message: '...' } },
	})
	@ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ hoặc không thể hủy' })
	@ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
	@ApiResponse({ status: 403, description: 'Không có quyền hủy lời mời này' })
	@ApiResponse({ status: 404, description: 'Không tìm thấy lời mời kết bạn' })
	async cancelFriendRequest(
		@Request() req,
		@Param('requestId') requestId: string,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<any>> {
		try {
			await this.friendRequestService.cancelFriendRequest(requestId, req.user.id, i18n);
			return {
				success: true,
				data: null,
				message: i18n.t('friend-request.REQUEST_CANCELLED_SUCCESS'),
			};
		} catch (error) {
			if (error instanceof BadRequestException) throw error;
			throw new BadRequestException(i18n.t('friend-request.REQUEST_CANCELLED_FAILED'));
		}
	}
}
