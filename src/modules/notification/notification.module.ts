import { Module } from '@nestjs/common';
import { NotificationController } from './controllers/notification.controller';
import { NotificationService } from './providers/notification.service';

@Module({
	controllers: [NotificationController],
	providers: [NotificationService],
})
export class NotificationModule {}
