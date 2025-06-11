import { registerAs } from '@nestjs/config';
import { Params as PinoModuleOptions } from 'nestjs-pino';

export default registerAs('pino', (): PinoModuleOptions => ({}));
