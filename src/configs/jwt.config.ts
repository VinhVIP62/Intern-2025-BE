import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
import { IEnvVars } from '@configs/env.config';

export default (configService: ConfigService<IEnvVars>): JwtModuleOptions => ({
	secret: configService.get('jwt', { infer: true })!.accessSecret,
	signOptions: { expiresIn: configService.get('jwt', { infer: true })!.accessTokenExpiration },
});
