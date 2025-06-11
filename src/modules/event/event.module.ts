import { Module } from '@nestjs/common';
import { EventController } from './controllers/event.controller';
import { EventService } from './providers/event.service';

@Module({
	controllers: [EventController],
	providers: [EventService],
})
export class EventModule {}
