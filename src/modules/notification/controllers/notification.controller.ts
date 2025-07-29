import { Response } from '@common/decorators/response.decorator';
import { ResponseEntity } from '@common/types';
import { Controller, Get, Post, Query, Param } from '@nestjs/common';
import { Req } from '@nestjs/common';
import { Request } from 'express';
import { NotificationService } from '../providers/notification.service';
import { I18nLang } from 'nestjs-i18n';

@Controller({ version: '1' })
export class NotificationController {
	constructor(private readonly notiService: NotificationService) {}

	@Get()
	@Response()
	async getNotification(
		@Req() request: Request,
		@Query('before') before: Date,
		@Query('limit') limit: number,
		@I18nLang() lang: string,
	): Promise<ResponseEntity<any>> {
		const user = request.user as { id: string };
		const res = await this.notiService.getNotification(user.id, limit, before, lang);
		return {
			success: true,
			data: res,
		};
	}

	@Get('unread')
	@Response()
	async getUnreadNotification(
		@Req() request: Request,
		@I18nLang() lang: string,
	): Promise<ResponseEntity<any>> {
		const user = request.user as { id: string };
		const res = await this.notiService.getUnreadNotification(user.id, lang);
		return {
			success: true,
			data: res,
		};
	}

	@Post('read/:notificationId')
	@Response()
	async updateReadNotification(
		@Req() request: Request,
		@I18nLang() lang: string,
		@Param('notificationId') notificationId: string,
	): Promise<ResponseEntity<any>> {
		const user = request.user as { id: string };
		const res = await this.notiService.updateReadNotification(user.id, notificationId, lang);
		return {
			success: true,
			data: res,
		};
	}
}
