import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import config from './configs/config';
import { LoggerModule } from 'nestjs-pino';
import loggerConfig from './configs/logger.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      expandVariables: true,
      cache: true,
      isGlobal: true,
      load: [config],
    }),
    LoggerModule.forRootAsync(loggerConfig.asProvider()),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
