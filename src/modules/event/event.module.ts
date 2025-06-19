import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './entities/event.schema';
import { EventController } from './controllers/event.controller';
import { EventService } from './providers/event.service';
import { IEventRepository } from './repositories/event.repository';
import { EventRepositoryImpl } from './repositories/event.repository.impl';

@Module({
	imports: [MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }])],
	controllers: [EventController],
	providers: [EventService, { provide: IEventRepository, useClass: EventRepositoryImpl }],
	exports: [EventService],
})
export class EventModule {}
