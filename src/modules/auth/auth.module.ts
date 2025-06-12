import { Module, Global } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { TokenService } from '@modules/auth/providers/token.service';
import { AuthService } from './providers/auth.service';
import { AuthController } from './controllers/auth.controller';
import jwtConfig from '@configs/jwt.config';
import { UserModule } from '@modules/user/user.module';
import { UserService } from '@modules/user/providers/user.service';

@Global()
@Module({
	imports: [
		PassportModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			useFactory: jwtConfig,
			inject: [ConfigService],
		}),
		UserModule,
	],
	controllers: [AuthController],
	providers: [
		JwtStrategy,
		JwtAuthGuard,
		RolesGuard,
		TokenService,
		AuthService,
		JwtService,
		TokenService,
		UserService,
	],
	exports: [JwtModule, JwtAuthGuard, RolesGuard, TokenService, AuthService],
})
export class AuthModule {}
