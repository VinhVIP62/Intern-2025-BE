import {
	Controller,
	Get,
	Put,
	Delete,
	Param,
	Query,
	Request,
	UseGuards,
	Version,
	BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { NotificationService } from '@modules/notification/providers/notification.service';
import { RolesGuard } from '@common/guards';
import { Roles } from '@common/decorators';
import { Role } from '@common/enum';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ResponseEntity } from '@common/types';
import {
	NotificationResponseDto,
	NotificationPaginationResponseDto,
} from '@modules/notification/dto';
import { PaginationQuery } from '@common/decorators/pagination-query.decorator';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';

@ApiTags('Notification')
@Controller('notifications')
export class NotificationController {
	constructor(private readonly notificationService: NotificationService) {}

	@Version('1')
	@Get()
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Lấy danh sách thông báo của người dùng hiện tại' })
	@ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
	@ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
	@ApiQuery({
		name: 'isRead',
		required: false,
		type: Boolean,
		description: 'Lọc theo đã đọc/chưa đọc (nếu không truyền thì lấy tất cả)',
	})
	@ApiResponse({
		status: 200,
		description: 'Lấy danh sách thông báo thành công',
		type: NotificationPaginationResponseDto,
	})
	async getNotifications(
		@Request() req,
		@I18n() i18n: I18nContext,
		@PaginationQuery(PaginationQueryDto) query: PaginationQueryDto,
		@Query('isRead') isRead?: string,
	): Promise<ResponseEntity<NotificationPaginationResponseDto>> {
		const userId = req.user.id;
		const isReadBool = isRead === undefined ? undefined : isRead === 'true';
		const { notifications, total } = await this.notificationService.getNotifications(
			userId,
			query.page ?? 1,
			query.limit ?? 10,
			isReadBool,
		);

		// Dịch message cho từng notification (nếu cần)
		const translatedNotifications = await Promise.all(
			notifications.map(async notification => ({
				...notification,
				message: await this.notificationService.translateNotificationMessage(
					notification.message,
					i18n,
				),
			})),
		);

		const totalPages = Math.ceil(total / (query.limit ?? 10));
		return {
			success: true,
			data: {
				notifications: translatedNotifications as NotificationResponseDto[],
				total,
				page: query.page ?? 1,
				limit: query.limit ?? 10,
				totalPages,
			},
			message: i18n.t('notification.LIST_RETRIEVED_SUCCESS'),
		};
	}

	@Version('1')
	@Put(':notificationId/read')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Đánh dấu thông báo đã đọc' })
	@ApiParam({ name: 'notificationId', description: 'ID của thông báo' })
	@ApiResponse({ status: 200, description: 'Đánh dấu thông báo đã đọc thành công' })
	async markAsRead(
		@Param('notificationId') notificationId: string,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<null>> {
		try {
			await this.notificationService.markAsRead(notificationId, i18n);
			return {
				success: true,
				message: i18n.t('notification.MARK_READ_SUCCESS'),
			};
		} catch (e) {
			throw new BadRequestException(e.message);
		}
	}

	@Version('1')
	@Put('read-all')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Đánh dấu tất cả thông báo đã đọc' })
	@ApiResponse({ status: 200, description: 'Đánh dấu tất cả thông báo đã đọc thành công' })
	async markAllAsRead(@Request() req, @I18n() i18n: I18nContext): Promise<ResponseEntity<null>> {
		const userId = req.user.id;
		await this.notificationService.markAllAsRead(userId);
		return {
			success: true,
			message: i18n.t('notification.MARK_ALL_READ_SUCCESS'),
		};
	}

	@Version('1')
	@Put(':notificationId/unread')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Đánh dấu thông báo là chưa đọc' })
	@ApiParam({ name: 'notificationId', description: 'ID của thông báo' })
	@ApiResponse({ status: 200, description: 'Đánh dấu thông báo là chưa đọc thành công' })
	async markAsUnread(
		@Param('notificationId') notificationId: string,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<null>> {
		try {
			await this.notificationService.markAsUnread(notificationId, i18n);
			return {
				success: true,
				message: i18n.t('notification.MARK_UNREAD_SUCCESS'),
			};
		} catch (e) {
			throw new BadRequestException(e.message);
		}
	}

	@Version('1')
	@Delete('clear-all')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Xóa (ẩn) tất cả thông báo của user' })
	@ApiResponse({ status: 200, description: 'Xóa tất cả thông báo thành công' })
	async clearAll(@Request() req, @I18n() i18n: I18nContext): Promise<ResponseEntity<null>> {
		try {
			const userId = req.user.id;
			await this.notificationService.clearAll(userId);
			return {
				success: true,
				message: i18n.t('notification.CLEAR_ALL_SUCCESS'),
			};
		} catch (e) {
			throw new BadRequestException(e.message);
		}
	}

	@Version('1')
	@Delete(':notificationId')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Xóa (ẩn) một thông báo cụ thể' })
	@ApiParam({ name: 'notificationId', description: 'ID của thông báo' })
	@ApiResponse({ status: 200, description: 'Xóa thông báo thành công' })
	async deleteNotification(
		@Param('notificationId') notificationId: string,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<null>> {
		try {
			await this.notificationService.deleteNotification(notificationId, i18n);
			return {
				success: true,
				message: i18n.t('notification.DELETE_SUCCESS'),
			};
		} catch (e) {
			throw new BadRequestException(e.message);
		}
	}
}
