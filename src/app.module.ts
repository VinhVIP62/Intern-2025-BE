import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from 'nestjs-pino';
import { pinoHttpConfig } from '@configs/pino.config';

@Module({
    imports: [
        LoggerModule.forRoot({
            pinoHttp: pinoHttpConfig,
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})

export class AppModule {}
