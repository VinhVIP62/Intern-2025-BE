import { Module } from '@nestjs/common';
import { NotificationService } from './providers/notification.service';
import { NotificationRepository } from './repository/notification.repository';
import { NotificationRepositoryImpl } from './repository/notification.repository.impl';
import { NotificationController } from './controllers/notification.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './entities/notification.schema';

@Module({
	imports: [MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }])],
	providers: [
		NotificationService,
		{
			provide: NotificationRepository,
			useClass: NotificationRepositoryImpl,
		},
	],
	controllers: [NotificationController],
	exports: [
		NotificationService,
		NotificationRepository,
		{
			provide: NotificationRepository,
			useClass: NotificationRepositoryImpl,
		},
	],
})
export class NotificationModule {}
