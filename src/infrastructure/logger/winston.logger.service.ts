import { Injectable, LoggerService } from '@nestjs/common';
import { createLogger, format, transports, Logger } from 'winston';
import { ILogger } from '../../domain/interfaces/logger.interface';
import * as path from 'path';
import { LOG_PREFIXES, LOG_LEVELS } from '../../shared/constants/logger.constants';

@Injectable()
export class WinstonLoggerService implements LoggerService, ILogger {
  private logger: Logger;

  constructor() {
    // Định nghĩa đường dẫn logs
    const logsDir = path.join(process.cwd(), 'src', 'infrastructure', 'logs');
    
    this.logger = createLogger({
      level: LOG_LEVELS.INFO,
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.splat(),
        format.json(),
      ),
      defaultMeta: { service: 'sport-hub' },
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.printf(({ timestamp, level, message, ...meta }) => {
              return `${timestamp} [${level}]: ${message}`;
            }),
          ),
        }),
        new transports.File({
          filename: path.join(logsDir, 'error.log'),
          level: LOG_LEVELS.ERROR,
        }),
        new transports.File({
          filename: path.join(logsDir, 'combined.log'),
        }),
      ],
    });
  }

  private formatMessage(prefix: string, message: string, context?: string): string {
    return `${prefix} ${context ? `[${context}]` : ''} ${message}`;
  }

  log(message: string, context?: string) {
    this.logger.info(this.formatMessage(LOG_PREFIXES.LOG, message, context));
  }

  error(message: string, trace?: string, context?: string) {
    const formattedMessage = this.formatMessage(LOG_PREFIXES.ERROR, message, context);
    if (trace) {
      this.logger.error(`${formattedMessage}\n${trace}`);
    } else {
      this.logger.error(formattedMessage);
    }
  }

  warn(message: string, context?: string) {
    this.logger.warn(this.formatMessage(LOG_PREFIXES.WARN, message, context));
  }

  debug(message: string, context?: string) {
    this.logger.debug(this.formatMessage(LOG_PREFIXES.DEBUG, message, context));
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(this.formatMessage(LOG_PREFIXES.VERBOSE, message, context));
  }
} 