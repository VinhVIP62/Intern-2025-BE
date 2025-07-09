import { ConfigService } from '@nestjs/config';
import { IEnvVars } from './env.config';
import { MongooseModuleAsyncOptions, MongooseModuleOptions } from '@nestjs/mongoose';

export const DatabaseConfig: MongooseModuleAsyncOptions['useFactory'] = (
	configService: ConfigService<IEnvVars>,
): MongooseModuleOptions => {
	const dbConfig = configService.get<IEnvVars['database']>('database');

	if (!dbConfig || typeof dbConfig.uri !== 'string') {
		throw new Error('Invalid or missing database URI in config');
	}
	return {
		uri: dbConfig.uri,
	};
};
