import { Global, Module } from '@nestjs/common';
import { WinstonLoggerService } from './winston.logger.service';
import { ILogger } from '../../domain/interfaces/logger.interface';
import { LOGGER_TOKEN } from '@src/infrastructure/logger/logger.constants';

@Global()
@Module({
  providers: [
    {
      provide: LOGGER_TOKEN,
      useClass: WinstonLoggerService,
    },
  ],
  exports: [LOGGER_TOKEN],
})
export class LoggerModule {}
