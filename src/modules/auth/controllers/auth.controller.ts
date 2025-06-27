import { Controller, Post, Body, UseGuards, Version, Req } from '@nestjs/common';
import { AuthService } from '../providers/auth.service';
import { Public } from '@common/decorators';
import { LoginDto, RegisterDto, ResponseAuthDto } from '../dto';
import { JwtRefreshAuthGuard } from '@common/guards';
import { AuthenticatedRequest } from '@common/types';

@Public()
@Controller()
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Version('1')
	@Post('login')
	async login(@Body() body: LoginDto): Promise<ResponseAuthDto> {
		const tokens = await this.authService.login(body.id, body.password);
		return tokens;
	}

	@Version('1')
	@Post('register')
	async register(
		@Body()
		body: RegisterDto,
	): Promise<ResponseAuthDto> {
		const tokens = await this.authService.register(
			body.username,
			body.password,
			body.mail,
			body.phone,
		);
		return tokens;
	}

	@Version('1')
	@Post('refresh')
	@UseGuards(JwtRefreshAuthGuard)
	async refreshToken(@Req() req: AuthenticatedRequest): Promise<ResponseAuthDto> {
		const tokens = await this.authService.refreshToken({
			sub: req.user,
		});
		return tokens;
	}
}
