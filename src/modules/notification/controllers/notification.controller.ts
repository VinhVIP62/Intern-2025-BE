import {
	Controller,
	Get,
	Query,
	Param,
	Patch,
	Delete,
	UseInterceptors,
	Version,
	ClassSerializerInterceptor,
	Req,
} from '@nestjs/common';
import { NotificationService } from '../providers/notification.service';
// import { CreateNotificationDto } from '../dto/create-notification.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from '@common/decorators/response.decorator';
import { ResponsePaging } from '@common/decorators/response-paging.decorator';
import { Request } from 'express';
import { PaginatedNotificationResponseDto } from '../dto/paginated-notification-response.dto';
// import { ResponseNotificationDto } from '../dto/response-notification.dto';
import { GetPaginatedParamDto } from '../dto/get-paginated-param.dto';
import { Public } from '@common/decorators';

@ApiTags('Notifications')
@Controller('notifications')
@Public()
export class NotificationController {
	constructor(private readonly service: NotificationService) {}

	// @Version('1')
	// @Post()
	// @ApiBearerAuth()
	// @Response('response.notification.create.success')
	// @ApiOperation({ summary: 'Tạo thông báo mới' })
	// @ApiResponse({ status: 201, type: ResponseNotificationDto })
	// async create(@Body() dto: CreateNotificationDto) {
	// 	return this.service.create(dto);
	// }

	@Version('1')
	@Get()
	@ApiBearerAuth()
	@ResponsePaging('response.notification.list.success')
	@ApiOperation({ summary: 'Lấy danh sách thông báo theo người dùng (phân trang)' })
	@ApiResponse({ status: 200, type: PaginatedNotificationResponseDto })
	@UseInterceptors(ClassSerializerInterceptor)
	async getUserNotifications(@Req() req: Request, @Query() query: GetPaginatedParamDto) {
		const { page = 1, limit = 10 } = query;
		return this.service.getUserNotifications(req.user!.id, page, limit);
	}

	@Version('1')
	@Patch(':id/read')
	@ApiBearerAuth()
	@Response('response.notification.read.success')
	@ApiOperation({ summary: 'Đánh dấu thông báo là đã đọc' })
	@ApiParam({ name: 'id', type: String, description: 'ID thông báo' })
	@ApiResponse({ status: 200 })
	async markAsRead(@Param('id') id: string) {
		return this.service.markAsRead(id);
	}

	@Version('1')
	@Delete(':id')
	@ApiBearerAuth()
	@Response('response.notification.delete.success')
	@ApiOperation({ summary: 'Xoá thông báo' })
	@ApiParam({ name: 'id', type: String, description: 'ID thông báo' })
	@ApiResponse({ status: 200 })
	async delete(@Param('id') id: string) {
		return this.service.delete(id);
	}
}
