import { Module } from '@nestjs/common';
import { EventController } from '@modules/event/controllers/event.controller';
import { EventService } from '@modules/event/providers/event.service';
import { UploadModule } from '@modules/upload/upload.module';
import { EventRepository } from '@modules/event/repositories/event.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from '@modules/event/entities/event.schema';

import { EventRepositoryImpl } from '@modules/event/repositories/event.repository.impl';
import { JoinEvent, JoinEventSchema } from '@modules/event/entities/joinEvent.schema';
import { NotificationModule } from '@modules/notification/notification.module';

@Module({
	controllers: [EventController],
	providers: [EventService, { provide: EventRepository, useClass: EventRepositoryImpl }],
	imports: [
		UploadModule,
		MongooseModule.forFeature([
			{ name: Event.name, schema: EventSchema },
			{ name: JoinEvent.name, schema: JoinEventSchema },
		]),
		NotificationModule,
	],
	exports: [EventService, { provide: EventRepository, useClass: EventRepositoryImpl }],
})
export class EventModule {}
