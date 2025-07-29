import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FriendService } from './providers/friend.service';
import { Friend, FriendSchema } from './entities/friend.schema';
import { FriendRepository } from './repositories/friend.repository.impl';
import { FriendController } from './controllers/friend.controller';
import { IFriendRepository } from './repositories/friend.repository';
import { NotificationService } from '@modules/notification/providers/notification.service';
import { NotificationMapper } from '@modules/notification/mapper/notification.mapper';
import { SocketModule } from 'src/websocket/socket.module';
import { SharedModule } from 'src/shared/shared.module';
import { FriendMapper } from './mapper/friend.mapper';
import { ChatModule } from '@modules/chat/chat.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Friend.name,
				schema: FriendSchema,
			},
		]),
		SocketModule,
		SharedModule,
		ChatModule,
	],
	controllers: [FriendController],
	providers: [
		FriendService,
		{
			provide: IFriendRepository,
			useClass: FriendRepository,
		},
		NotificationService,
		NotificationMapper,
		FriendMapper,
	],
	exports: [FriendService],
})
export class FriendModule {}
