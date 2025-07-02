import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Friend, FriendSchema } from '@modules/friend/entities/friend.schema';

@Module({
	imports: [MongooseModule.forFeature([{ name: Friend.name, schema: FriendSchema }])],
	exports: [MongooseModule],
})
export class SharedModule {}
