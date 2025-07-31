import { Body, Controller, Post, Delete, Req, Version } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Roles } from '@common/decorators';
import { Role } from '@common/enum';
import { Response } from '@common/decorators/response.decorator';
import { UserDeviceService } from '../providers/user-device.service';
import { RegisterDeviceDto } from '../dto/register-device.dto';
import { UnregisterDeviceDto } from '../dto/unregister-device.dto';

@ApiTags('User Device')
@Controller('user-device')
export class UserDeviceController {
	constructor(private readonly userDeviceService: UserDeviceService) {}

	@Version('1')
	@Post()
	@ApiBearerAuth()
	@Roles(Role.USER, Role.MODERATOR, Role.ADMIN)
	@ApiOperation({ summary: 'Đăng ký thiết bị để nhận thông báo push (FCM)' })
	@ApiResponse({ status: 201, description: 'Đăng ký thiết bị thành công' })
	@Response('response.userDevice.register.success')
	async registerDevice(@Req() req: Request, @Body() body: RegisterDeviceDto) {
		await this.userDeviceService.registerDevice(req.user!.id, body.token, body.platform);
		return;
	}

	@Version('1')
	@Delete()
	@ApiBearerAuth()
	@Roles(Role.USER, Role.MODERATOR, Role.ADMIN)
	@ApiOperation({ summary: 'Hủy đăng ký thiết bị (ngừng nhận thông báo)' })
	@ApiResponse({ status: 200, description: 'Hủy đăng ký thiết bị thành công' })
	@Response('response.userDevice.unregister.success')
	async unregisterDevice(@Req() req: Request, body: UnregisterDeviceDto) {
		await this.userDeviceService.deactivateDeviceToken(body.token);
		return;
	}
}
