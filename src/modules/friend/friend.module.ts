import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FriendService } from './providers/friend.service';
import { Friend, FriendSchema } from './entities/friend.schema';
import { FriendRepository } from './repositories/friend.repository.impl';
import { FriendController } from './controllers/friend.controller';
import { IFriendRepository } from './repositories/friend.repository';

@Module({
	imports: [MongooseModule.forFeature([{ name: Friend.name, schema: FriendSchema }])],
	controllers: [FriendController],
	providers: [FriendService, { provide: IFriendRepository, useClass: FriendRepository }],
	exports: [FriendService],
})
export class FriendModule {}
