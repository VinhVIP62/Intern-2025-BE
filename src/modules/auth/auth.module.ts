import { Module, Global, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard, RolesGuard } from '@common/guards';
import { TokenService } from '@modules/auth/providers/token.service';
import { AuthService } from './providers/auth.service';
import { AuthController } from './controllers/auth.controller';
import { IEnvVars } from '@configs/config';
import { JwtAccessConfig, JwtRefreshConfig } from '@configs/index';
import { JwtRefreshStrategy } from './strategies/jwt-refresh-strategy';
import { UserModule } from '@modules/user/user.module';

@Global()
@Module({
	imports: [PassportModule, forwardRef(() => UserModule)],
	controllers: [AuthController],
	providers: [
		JwtStrategy,
		JwtRefreshStrategy,
		JwtAuthGuard,
		RolesGuard,
		TokenService,
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
