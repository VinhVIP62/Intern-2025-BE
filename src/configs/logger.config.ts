import { ConfigService } from '@nestjs/config';
import { Params as PinoModuleOptions } from 'nestjs-pino';
import { IEnvVars } from './config';

export default (
  configService: ConfigService<IEnvVars>,
): PinoModuleOptions => ({});
