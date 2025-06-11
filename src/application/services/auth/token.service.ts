import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user.service';
import * as crypto from 'crypto';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private userService: UserService,
  ) {}

  async generateTokens(userId: string, email: string, roles: string[]) {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(userId, email, roles),
      this.generateRefreshToken(userId),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async generateAccessToken(userId: string, email: string, roles: string[]) {
    const payload = {
      sub: userId,
      email,
      roles,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: this.configService.get<string>('jwt.accessTokenExpiration'),
    });
  }

  private async generateRefreshToken(userId: string) {
    const token = crypto.randomBytes(40).toString('hex');
    await this.userService.updateRefreshToken(userId, token);
    return token;
  }

  async validateRefreshToken(token: string): Promise<boolean> {
    const user = await this.userService.findByRefreshToken(token);
    return !!user;
  }

  async revokeRefreshToken(token: string): Promise<void> {
    const user = await this.userService.findByRefreshToken(token);
    if (user) {
      await this.userService.updateRefreshToken(user._id, '');
    }
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.userService.updateRefreshToken(userId, '');
  }
}
