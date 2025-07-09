import { Module } from '@nestjs/common';
import { FriendController } from './controllers/friend.controller';
import { FriendService } from './providers/friend.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FriendReqSchema } from './entities/friend-req.schema';
import { FriendReq } from './entities/friend-req.schema';
import { friendRepository } from './repositories';

@Module({
	imports: [MongooseModule.forFeature([{ name: FriendReq.name, schema: FriendReqSchema }])],
	controllers: [FriendController],
	providers: [FriendService, friendRepository],
})
export class FriendModule {}
