import { Controller, Delete, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from '../providers/notification.service';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { Response } from 'src/common/decorators/response.decorator';
import { Request } from 'express';
import { NotificationQueryDto } from '../dto/notification.query.dto';

@Controller()
export class NotificationController {
	constructor(private readonly notificationService: NotificationService) {}

	@Get()
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Get notifications' })
	@ApiQuery({ name: 'type', required: false, description: 'Filter notifications by type' })
	@ApiQuery({ name: 'page', required: false, description: 'Page number for pagination' })
	@ApiQuery({ name: 'limit', required: false, description: 'Number of notifications per page' })
	@Response()
	async getNotifications(@Req() req: Request, @Query() query: NotificationQueryDto) {
		const userId = (req.user as any).id;
		return this.notificationService.getNotifications(userId, query);
	}

	@Patch(':id')
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Read notification' })
	@Response()
	async readNotification(@Req() req: Request, @Param('id') notificationId: string) {
		const userId = (req.user as any).id;
		return this.notificationService.readNotification(userId, notificationId);
	}

	@Delete(':id')
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Delete notification' })
	@Response()
	async deleteNotification(@Req() req: Request, @Param('id') notificationId: string) {
		const userId = (req.user as any).id;
		return this.notificationService.deleteNotification(userId, notificationId);
	}
}
