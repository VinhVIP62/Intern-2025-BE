import { Roles } from '@common/decorators';
import { Role } from '@common/enum';
import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Get,
	Param,
	Patch,
	Req,
	UseInterceptors,
	Version,
} from '@nestjs/common';
import { UserService } from '../providers/user.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseUserDto, UpdateUserDto } from '../dto';
import { Response } from '@common/decorators/response.decorator';
import { UpdateAvatarDto } from '../dto/update-avatar.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { Request } from 'express';

@ApiTags('Users')
@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Version('1')
	@Patch('me')
	@Roles(Role.USER, Role.MODERATOR, Role.ADMIN)
	@Response('response.user.update.success')
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@ApiOperation({
		summary: 'Cập nhật thông tin cá nhân người dùng hiện tại',
		description:
			'Cập nhật thông tin cá nhân của người dùng đang đăng nhập dựa vào token JWT. Không cần truyền ID.',
	})
	@ApiResponse({
		status: 200,
		description: 'Cập nhật thông tin thành công',
	})
	async updateProfile(@Req() req: Request, @Body() dto: UpdateUserDto) {
		const updatedUser = await this.userService.updateProfile(req.user!.id, dto);
		return updatedUser;
	}

	@Version('1')
	@Get('me')
	@Response('response.user.get.success')
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@ApiOperation({
		summary: 'Lấy thông tin cá nhân của người dùng hiện tại',
		description:
			'Lấy thông tin cá nhân của người dùng đang đăng nhập dựa vào token JWT. Không cần truyền ID.',
	})
	@ApiResponse({
		status: 200,
		description: 'Lấy thông tin cá nhân thành công',
		type: [ResponseUserDto],
	})
	async getProfile(@Req() req: Request) {
		const user = await this.userService.getProfile(req.user!.id, req.user!.id);
		return user;
	}

	@Version('1')
	@Patch('profile/avatar')
	@Response('response.user.update.success')
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@ApiOperation({
		summary: 'Cập nhật avatar cá nhân người dùng hiện tại',
		description:
			'Cập nhật avatar cá nhân của người dùng đang đăng nhập dựa vào token JWT. Không cần truyền ID.',
	})
	@ApiResponse({
		status: 200,
		description: 'Cập nhật thông tin thành công',
	})
	async updateAvatar(@Req() req: Request, @Body() body: UpdateAvatarDto) {
		const updatedUser = await this.userService.updateAvatar(req.user!.id, body.avatarUrl);
		return updatedUser;
	}

	@Version('1')
	@Patch('change-password')
	@Roles(Role.USER, Role.MODERATOR, Role.ADMIN)
	@Response('response.user.changePassword.success')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Đổi mật khẩu người dùng hiện tại',
		description: 'Đổi mật khẩu dựa trên mật khẩu hiện tại của người dùng đang đăng nhập.',
	})
	@ApiResponse({
		status: 200,
		description: 'Đổi mật khẩu thành công',
	})
	async changePassword(@Req() req: Request, @Body() dto: ChangePasswordDto) {
		await this.userService.changePassword(req.user!.id, dto);
		return;
	}

	@Version('1')
	@Get(':id')
	@Response('response.user.get.success')
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@ApiOperation({
		summary: 'Lấy thông tin người dùng khác',
		description: 'Lấy thông tin người dùng theo ID.',
	})
	@ApiResponse({
		status: 200,
		description: 'Lấy thông tin người dùng thành công',
		type: [ResponseUserDto],
	})
	async getUserById(@Req() req: Request, @Param('id') id: string) {
		const user = await this.userService.getProfile(id, req.user!.id);
		return user;
	}
}
