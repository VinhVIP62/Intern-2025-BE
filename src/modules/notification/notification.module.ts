import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationController } from './controllers/notification.controller';
import { NotificationService } from './providers/notification.service';
import { Notification, NotificationSchema } from './entities/notification.schema';
import { INotificationRepository } from './repositories/notification.repository';
import { NotificationRepositoryImpl } from './repositories/notification.repository.impl';

@Module({
	imports: [MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }])],
	controllers: [NotificationController],
	providers: [
		NotificationService,
		{ provide: INotificationRepository, useClass: NotificationRepositoryImpl },
	],
	exports: [NotificationService],
})
export class NotificationModule {}
