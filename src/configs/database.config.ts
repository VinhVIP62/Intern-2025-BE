// src/configs/mongoose.config.ts
import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';
import { IEnvVars } from './config';

export const mongooseConfig = (configService: ConfigService<IEnvVars>): MongooseModuleOptions => ({
	uri: configService.get('database', { infer: true })!.uri,
});
