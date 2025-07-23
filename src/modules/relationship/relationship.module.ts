import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RelationshipController } from './controllers/relationship.controller';
import { Block, BlockSchema, Friendship, FriendshipSchema } from './entities';
import { RelationshipService } from './providers/relationship.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Friendship.name,
				schema: FriendshipSchema,
			},
			{
				name: Block.name,
				schema: BlockSchema,
			},
		]),
	],
	controllers: [RelationshipController],
	providers: [RelationshipService],
})
export class RelationshipModule {}
