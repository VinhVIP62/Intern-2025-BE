import { Module, Global } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from '@infrastructure/auth/strategies/jwt.strategy';
import { JwtAuthGuard } from '@src/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '@src/presentation/guards/roles.guard';
import { TokenService } from '@application/services/auth/token.service';
import { AuthService } from '@application/services/auth.service';
import { AuthController } from '@presentation/controllers/auth.controller';

@Global()
@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret') || 'secret',
        signOptions: { expiresIn: configService.get<string>('jwt.accessTokenExpiration') || '15m' }, // Access token expires in 15 minutes
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, JwtAuthGuard, RolesGuard, TokenService, AuthService, JwtService],
  exports: [JwtModule, JwtAuthGuard, RolesGuard, TokenService, AuthService],
})
export class AuthModule {}
