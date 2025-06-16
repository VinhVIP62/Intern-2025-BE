// src/common/logger/logger.module.ts
import { Module } from '@nestjs/common';
import { AppLoggerService } from './logger.service';
import { winstonLogger } from './winston.logger';

@Module({
	providers: [
		AppLoggerService,
		{
			provide: 'winston',
			useValue: winstonLogger,
		},
	],
	exports: [AppLoggerService],
})
export class LoggerModule {}
