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
import { NotificationService } from '../providers/notification.service';
import { RolesGuard } from '@common/guards';
import { Roles } from '@common/decorators';
import { Role } from '@common/enum';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ResponseEntity } from '@common/types';
import { NOTIFICATION_MESSAGE_KEYS } from '@common/constants/message-key.constant';

@ApiTags('Notification')
@Controller('notifications')
export class NotificationController {
	constructor(private readonly notificationService: NotificationService) {}

	/**
	 * Helper function to translate notification message
	 */
	private translateNotificationMessage(message: string, i18n: I18nContext): string {
		let translatedMessage = message;

		// Tìm và thay thế các i18n key trong message
		NOTIFICATION_MESSAGE_KEYS.forEach(key => {
			if (translatedMessage.includes(key)) {
				try {
					const translatedValue = i18n.t(`notification.${key}`);
					translatedMessage = translatedMessage.replace(key, translatedValue);
				} catch (error) {
					// Nếu key không tồn tại, giữ nguyên key gốc
					console.warn(`Translation key not found: notification.${key}`);
				}
			}
		});

		return translatedMessage;
	}

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
	@ApiResponse({ status: 200, description: 'Lấy danh sách thông báo thành công' })
	async getNotifications(
		@Request() req,
		@I18n() i18n: I18nContext,
		@Query('page') page: number = 1,
		@Query('limit') limit: number = 10,
		@Query('isRead') isRead?: string,
	): Promise<ResponseEntity<any>> {
		const userId = req.user.id;
		const isReadBool = isRead === undefined ? undefined : isRead === 'true';
		const { notifications, total } = await this.notificationService.getNotifications(
			userId,
			page,
			limit,
			isReadBool,
		);

		// Dịch message cho từng notification
		const translatedNotifications = notifications.map(notification => ({
			...notification,
			message: this.translateNotificationMessage(notification.message, i18n),
		}));

		const totalPages = Math.ceil(total / limit);
		return {
			success: true,
			data: { notifications: translatedNotifications, total, page, limit, totalPages },
			message: i18n.t('notification.LIST_RETRIEVED_SUCCESS'),
		};
	}

	@Version('1')
	@Get('unread-count')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Lấy số lượng và danh sách thông báo chưa đọc' })
	@ApiQuery({
		name: 'page',
		required: false,
		type: Number,
		example: 1,
		description: 'Trang thông báo chưa đọc muốn lấy (không bắt buộc)',
	})
	@ApiQuery({
		name: 'limit',
		required: false,
		type: Number,
		example: 10,
		description: 'Số lượng thông báo chưa đọc muốn lấy (không bắt buộc)',
	})
	@ApiResponse({
		status: 200,
		description: 'Lấy số lượng và danh sách thông báo chưa đọc thành công',
	})
	async getUnreadCount(
		@Request() req,
		@I18n() i18n: I18nContext,
		@Query('page') page?: number,
		@Query('limit') limit?: number,
	): Promise<ResponseEntity<{ count: number; notifications: any[] }>> {
		const { count, notifications } = await this.notificationService.getUnreadNotificationsWithCount(
			req.user.id,
			page,
			limit,
		);

		// Dịch message cho từng notification
		const translatedNotifications = notifications.map(notification => ({
			...notification,
			message: this.translateNotificationMessage(notification.message, i18n),
		}));

		return {
			success: true,
			data: { count, notifications: translatedNotifications },
			message: i18n.t('notification.UNREAD_COUNT_SUCCESS'),
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
