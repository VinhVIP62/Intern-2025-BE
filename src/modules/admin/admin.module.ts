import { Module } from '@nestjs/common';
import { AdminController } from './controllers/admin.controller';
import { AdminService } from './providers/admin.service';
import { SharedModule } from 'src/shared/shared.module';
import { NotificationService } from '@modules/notification/providers/notification.service';
import { NotificationMapper } from '@modules/notification/mapper/notification.mapper';
import { SocketModule } from 'src/websocket/socket.module';

@Module({
	imports: [SharedModule, SocketModule],
	controllers: [AdminController],
	providers: [AdminService, NotificationService, NotificationMapper],
})
export class AdminModule {}
