import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventController } from './controllers/event.controller';
import { EventService } from './providers/event.service';
import { Event, EventSchema } from './entities/event.schema';
import { IEventRepository } from './repositories/event.repository';
import { EventRepositoryImpl } from './repositories/event.repository.impl';
import { IEventParticipantRepository } from './repositories/event-participant.repository';
import { EventParticipantRepositoryImpl } from './repositories/event-participant.repository.impl';
import { EventParticipant, EventParticipantSchema } from './entities/event-participant.schema';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
		MongooseModule.forFeature([{ name: EventParticipant.name, schema: EventParticipantSchema }]),
	],
	controllers: [EventController],
	providers: [
		EventService,
		{
			provide: IEventRepository,
			useClass: EventRepositoryImpl,
		},
		{
			provide: IEventParticipantRepository,
			useClass: EventParticipantRepositoryImpl,
		},
	],
	exports: [EventService],
})
export class EventModule {}
