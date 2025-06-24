import { Public, Roles } from '@common/decorators';
import { Role } from '@common/enum';
import { RolesGuard } from '@common/guards';
import { Body, Controller, Get, Post, UseGuards, Version } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from '../providers/user.service';
import { ResponseEntity } from '@common/types';

@ApiTags('User')
@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Public()
	@Version('1')
	@Post('new-password')
	@ApiOperation({ summary: 'Tạo mật khẩu mới' })
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				email: { type: 'string' },
				newPassword: { type: 'string' },
			},
		},
	})
	@ApiResponse({ status: 200, description: 'Tạo mật khẩu mới thành công' })
	async updateNewPassword(
		@Body() body: { email: string; newPassword: string },
	): Promise<ResponseEntity<string>> {
		const { email, newPassword } = body;
		await this.userService.updateNewPassword(email, newPassword);
		return {
			success: true,
			data: 'Mật khẩu đã được cập nhật thành công',
		};
	}
}
