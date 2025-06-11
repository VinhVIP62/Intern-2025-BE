import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Logger } from 'nestjs-pino';

@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        private logger: Logger,
    ) {}
    @Get()
    getHello(): string {
        return this.appService.getHello();
    }
    
}