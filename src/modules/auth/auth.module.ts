import { Module, Global } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import googleOauthConfig from '@configs/google-oauth.config';
import { GoogleStrategy } from './strategies/google.strategy';
import { VerificationModule } from '@modules/verification/verification.module';

@Global()
@Module({
	imports: [
		PassportModule,
		UserModule,
		VerificationModule,
		ConfigModule.forFeature(googleOauthConfig),
	],
	controllers: [AuthController],
	providers: [
		JwtStrategy,
		JwtRefreshStrategy,
		JwtAuthGuard,
		RolesGuard,
		TokenService,
		AuthService,
		GoogleStrategy,
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
