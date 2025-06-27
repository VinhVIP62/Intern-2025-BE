import { ForbiddenException, Injectable, NotFoundException, Inject } from '@nestjs/common';
import { ResetPasswordDto } from '../dto/request/resetPassWord.dto';
import { UserService } from '@modules/user/providers/user.service';
import type { Redis } from 'ioredis';
import { ResetPasswordResponse } from '../dto/response/resetPasswordResponse.dto';
import { error } from 'console';
import bcrypt from 'bcrypt';

@Injectable()
export class ResetPasswordService {
	constructor(
		private readonly userService: UserService,
		@Inject('REDIS_CLIENT') private readonly redis: Redis,
	) {}

	async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<ResetPasswordResponse> {
		const { resetPasswordToken, newPassword } = resetPasswordDto;
		const email = await this.redis.get(`resetToken:${resetPasswordToken}`);
		if (!email) {
			throw new ForbiddenException('error.forbidden');
		}
		const user = await this.userService.findOneByEmail(email);
		if (!user) {
			throw new NotFoundException('error.userNotFound');
		}
		const response = new ResetPasswordResponse();
		try {
			const hashPassword = bcrypt.hashSync(newPassword, 10);
			user.password = hashPassword;
			await this.userService.update(user.id, user);
			response.message = 'resetPassword.success';
			await this.redis.del(`resetToken:${resetPasswordToken}`);
			return response;
		} catch (error) {
			response.message = 'resetPassword.failed';
			return response;
		}
	}
}
