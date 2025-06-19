import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FriendRequest, FriendRequestSchema } from './entities/friend-request.schema';
import { FriendRequestController } from './controllers/friend-request.controller';
import { FriendRequestService } from './providers/friend-request.service';
import { IFriendRequestRepository } from './repositories/friend-request.repository';
import { FriendRequestRepositoryImpl } from './repositories/friend-request.repository.impl';

@Module({
	imports: [MongooseModule.forFeature([{ name: FriendRequest.name, schema: FriendRequestSchema }])],
	controllers: [FriendRequestController],
	providers: [
		FriendRequestService,
		{ provide: IFriendRequestRepository, useClass: FriendRequestRepositoryImpl },
	],
	exports: [FriendRequestService],
})
export class FriendRequestModule {}
