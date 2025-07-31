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
import { UserModule } from '@modules/user/user.module';
import { FriendModule } from '@modules/friend/friend.module';
import { LoggerModule } from '@common/logger/logger.module';
import { ElasticModule } from '@modules/elastic/elastic.module';
import { FileModule } from '@modules/file/file.module';
import { NotificationModule } from '@modules/notification/notification.module';
import { RealtimeModule } from '@modules/realtime/realtime.module';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
		MongooseModule.forFeature([{ name: EventParticipant.name, schema: EventParticipantSchema }]),
		UserModule,
		FriendModule,
		LoggerModule,
		ElasticModule,
		FileModule,
		NotificationModule,
		RealtimeModule,
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
