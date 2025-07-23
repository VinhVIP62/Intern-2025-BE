import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EventController } from './controllers/event.controller';
import { Event, EventParticipant, EventParticipantSchema, EventSchema } from './entities';
import { EventService } from './providers/event.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Event.name,
				schema: EventSchema,
			},
			{
				name: EventParticipant.name,
				schema: EventParticipantSchema,
			},
		]),
	],
	controllers: [EventController],
	providers: [EventService],
})
export class EventModule {}
