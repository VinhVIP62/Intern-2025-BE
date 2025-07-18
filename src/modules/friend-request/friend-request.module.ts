import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FriendRequest, FriendRequestSchema } from './entities/friend-request.schema';
import { User, UserSchema } from '@modules/user/entities/user.schema';
import { FriendRequestController } from './controllers/friend-request.controller';
import { FriendsController } from './controllers/friend.controller';
import { FriendRequestService } from './providers/friend-request.service';
import { IFriendRequestRepository } from './repositories/friend-request.repository';
import { FriendRequestRepositoryImpl } from './repositories/friend-request.repository.impl';
import { IUserRepository } from '@modules/user/repositories/user.repository';
import { UserRepositoryImpl } from '@modules/user/repositories/user.repository.impl';
import { UserModule } from '@modules/user/user.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: FriendRequest.name, schema: FriendRequestSchema },
			{ name: User.name, schema: UserSchema },
		]),
		UserModule,
	],
	controllers: [FriendRequestController, FriendsController],
	providers: [
		FriendRequestService,
		{ provide: IFriendRequestRepository, useClass: FriendRequestRepositoryImpl },
		{ provide: IUserRepository, useClass: UserRepositoryImpl },
	],
	exports: [FriendRequestService],
})
export class FriendRequestModule {}
