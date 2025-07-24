import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './entities/event.schema';
import { EventController } from './controllers/event.controller';
import { EventService } from './providers/event.service';
import { IEventRepository } from './repositories/event.repository';
import { EventRepositoryImpl } from './repositories/event.repository.impl';
import { GroupModule } from '@modules/group/group.module';
import { EventInvitation, EventInvitationSchema } from './entities/event-invitation.schema';
import { UserModule } from '@modules/user/user.module';
import { NotificationService } from '@modules/notification/providers/notification.service';
import { NotificationModule } from '@modules/notification/notification.module';
@Module({
	imports: [
		MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
		MongooseModule.forFeature([{ name: EventInvitation.name, schema: EventInvitationSchema }]),
		forwardRef(() => GroupModule),
		forwardRef(() => UserModule),
		forwardRef(() => NotificationModule),
	],
	controllers: [EventController],
	providers: [EventService, { provide: IEventRepository, useClass: EventRepositoryImpl }],
	exports: [EventService],
})
export class EventModule {}
