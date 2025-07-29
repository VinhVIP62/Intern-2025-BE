import { Module } from '@nestjs/common';
import { NotificationController } from './controllers/notification.controller';
import { NotificationService } from './providers/notification.service';
import { INotificationRepository } from './repositories/notification.repository';
import { NotificationRepositoryImpl } from './repositories/notification.repository.impl';
import { SharedModule } from 'src/shared/shared.module';
import { SocketModule } from 'src/websocket/socket.module';
import { NotificationMapper } from './mapper/notification.mapper';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './entities/notification.schema';

import { ChatModule } from '@modules/chat/chat.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Notification.name,
				schema: NotificationSchema,
			},
		]),
		SharedModule,
		SocketModule,
		ChatModule,
	],
	controllers: [NotificationController],
	providers: [
		NotificationService,
		{
			provide: INotificationRepository,
			useClass: NotificationRepositoryImpl,
		},
		NotificationMapper,
	],
	exports: [NotificationService, NotificationMapper, INotificationRepository],
})
export class NotificationModule {}
