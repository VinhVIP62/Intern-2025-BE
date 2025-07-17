import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationController } from './controllers/notification.controller';
import { NotificationService } from './providers/notification.service';
import { Notification, NotificationSchema } from './entities/notification.schema';
import { INotificationRepository } from './repositories/notification.repository';
import { NotificationRepositoryImpl } from './repositories/notification.repository.impl';
import { IUserRepository } from '@modules/user/repositories/user.repository';
import { UserRepositoryImpl } from '@modules/user/repositories/user.repository.impl';
import { User, UserSchema } from '@modules/user/entities/user.schema';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
		MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
	],
	controllers: [NotificationController],
	providers: [
		NotificationService,
		{ provide: INotificationRepository, useClass: NotificationRepositoryImpl },
		{ provide: IUserRepository, useClass: UserRepositoryImpl },
	],
	exports: [NotificationService],
})
export class NotificationModule {}
