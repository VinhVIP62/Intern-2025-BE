import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
import { IEnvVars } from './config';

export default (configService: ConfigService<IEnvVars>): JwtModuleOptions => ({
	secret: configService.get('jwt', { infer: true })!.secret,
	signOptions: { expiresIn: configService.get('jwt', { infer: true })!.accessTokenExpiration }, // Access token expires in 15 minutes
});
