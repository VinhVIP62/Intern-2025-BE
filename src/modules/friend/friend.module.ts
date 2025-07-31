import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FriendRequest, FriendRequestSchema } from './entities/friend-request.schema';
import { FriendRequestService } from './providers/friend-request.service';
import { FriendRequestController } from './controllers/friend-request.controller';
import { FriendRequestRepositoryImpl } from './repositories/friend-request.repository.impl';
import { IFriendRequestRepository } from './repositories/friend-request.repository';
import { IFriendRepository } from './repositories/friend.repository';
import { FriendRepositoryImpl } from './repositories/friend.repository.impl';
import { Friend, FriendSchema } from './entities/friend.schema';
import { FriendController } from './controllers/friend.controller';
import { FriendService } from './providers/friend.service';
import { UserModule } from '@modules/user/user.module';
import { NotificationModule } from '@modules/notification/notification.module';
import { RealtimeModule } from '@modules/realtime/realtime.module';
import { FirebaseModule } from '@modules/firebase/firebase.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: FriendRequest.name, schema: FriendRequestSchema },
			{ name: Friend.name, schema: FriendSchema },
		]),
		forwardRef(() => UserModule),
		NotificationModule,
		RealtimeModule,
		FirebaseModule,
	],
	controllers: [FriendRequestController, FriendController],
	providers: [
		FriendRequestService,
		FriendService,
		{
			provide: IFriendRequestRepository,
			useClass: FriendRequestRepositoryImpl,
		},
		{
			provide: IFriendRepository,
			useClass: FriendRepositoryImpl,
		},
	],
	exports: [IFriendRepository, IFriendRequestRepository, IFriendRepository],
})
export class FriendModule {}
