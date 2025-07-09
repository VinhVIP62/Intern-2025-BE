// src/common/logger/app-logger.service.ts
import { Injectable, LoggerService } from '@nestjs/common';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';

@Injectable()
export class AppLoggerService implements LoggerService {
	constructor(@Inject('winston') private readonly logger: Logger) {}

	log(message: string, context?: string) {
		this.logger.info(message, { context });
	}

	error(message: string, trace?: string, context?: string) {
		this.logger.error(message, { trace, context });
	}

	warn(message: string, context?: string) {
		this.logger.warn(message, { context });
	}

	debug(message: string, context?: string) {
		this.logger.debug(message, { context });
	}

	verbose?(message: string, context?: string) {
		this.logger.verbose?.(message, { context });
	}
}
