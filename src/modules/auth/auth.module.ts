import { Module, Global } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { TokenService } from '@modules/auth/providers/token.service';
import { AuthService } from './providers/auth.service';
import { AuthController } from './controllers/auth.controller';
import { UserModule } from '@modules/user/user.module';
import { IEnvVars } from '@configs/config';
import { JwtAccessConfig, JwtRefreshConfig } from '@configs/index';
import { JwtRefreshStrategy } from './strategies/jwt-refresh-strategy';
import { OtpService } from './providers/otp.service';
import { MailModule } from '@modules/mail/mail.module';
import { ResetPasswordService } from './providers/resetPassword.service';

@Global()
@Module({
	imports: [PassportModule, UserModule, MailModule],
	controllers: [AuthController],
	providers: [
		JwtStrategy,
		JwtRefreshStrategy,
		JwtAuthGuard,
		RolesGuard,
		TokenService,
		OtpService,
		ResetPasswordService,
		AuthService,
		{
			inject: [ConfigService],
			provide: 'JWT_ACCESS_TOKEN',
			useFactory: (configService: ConfigService<IEnvVars>) => {
				const config = JwtAccessConfig(configService);
				return new JwtService(config);
			},
		},
		{
			inject: [ConfigService],
			provide: 'JWT_REFRESH_TOKEN',
			useFactory: (configService: ConfigService<IEnvVars>) => {
				const config = JwtRefreshConfig(configService);
				return new JwtService(config);
			},
		},
	],
	exports: [JwtAuthGuard, RolesGuard, TokenService, AuthService],
})
export class AuthModule {}
