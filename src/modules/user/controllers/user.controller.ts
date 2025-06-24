import { Public, Roles } from '@common/decorators';
import { Role } from '@common/enum';
import { RolesGuard } from '@common/guards';
import {
	Body,
	Controller,
	Get,
	Post,
	Put,
	UseGuards,
	Version,
	Param,
	Request,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { UserService } from '../providers/user.service';
import { ResponseEntity } from '@common/types';
import { ResponseProfileDto, UpdateProfileDto } from '../dto';

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

	@Version('1')
	@Get('profile')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Lấy thông tin profile của người dùng hiện tại' })
	@ApiResponse({
		status: 200,
		description: 'Lấy thông tin profile thành công',
		type: ResponseProfileDto,
	})
	async getCurrentUserProfile(@Request() req): Promise<ResponseEntity<ResponseProfileDto>> {
		const userId = req.user.id;
		const profile = await this.userService.getProfile(userId);
		return {
			success: true,
			data: profile,
		};
	}

	@Version('1')
	@Get(':userId/profile')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Lấy thông tin profile của người dùng theo ID' })
	@ApiParam({ name: 'userId', description: 'ID của người dùng' })
	@ApiResponse({
		status: 200,
		description: 'Lấy thông tin profile thành công',
		type: ResponseProfileDto,
	})
	async getUserProfile(
		@Param('userId') userId: string,
	): Promise<ResponseEntity<ResponseProfileDto>> {
		const profile = await this.userService.getProfile(userId);
		return {
			success: true,
			data: profile,
		};
	}

	@Version('1')
	@Put('profile')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Cập nhật thông tin profile của người dùng hiện tại' })
	@ApiBody({ type: UpdateProfileDto })
	@ApiResponse({
		status: 200,
		description: 'Cập nhật profile thành công',
		type: String,
	})
	async updateCurrentUserProfile(
		@Request() req,
		@Body() updateData: UpdateProfileDto,
	): Promise<ResponseEntity<string>> {
		const userId = req.user.id;
		const updatedProfile = await this.userService.updateProfile(userId, updateData);
		return {
			success: true,
			data: 'Cập nhật profile thành công',
		};
	}
}
