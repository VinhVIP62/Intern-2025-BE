import { Module, Global } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtAuthGuard } from '@common/guards/jwt-access.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { TokenService } from '@modules/auth/providers/token.service';
import { AuthService } from './providers/auth.service';
import { AuthController } from './controllers/auth.controller';
import { UserModule } from '@modules/user/user.module';
import { IEnvVars } from '@configs/env.config';
import { JwtAccessConfig, JwtRefreshConfig } from '@configs/index';
import { JwtRefreshStrategy } from './strategies/jwt-refresh-strategy';
import { MailModule } from '@modules/mail/mail.module';
import { OtpService } from './providers/otp.service';
import { JwtTempStrategy } from './strategies/jwt-temp.strategy';

@Global()
@Module({
	imports: [PassportModule, UserModule, MailModule],
	controllers: [AuthController],
	providers: [
		JwtAccessStrategy,
		JwtRefreshStrategy,
		JwtTempStrategy,
		JwtAuthGuard,
		RolesGuard,
		TokenService,
		AuthService,
		OtpService,
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
