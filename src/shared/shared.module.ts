import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Friend, FriendSchema } from '@modules/friend/entities/friend.schema';
import { User, UserSchema } from '@modules/user/entities/user.schema';
import { Profile, ProfileSchema } from '@modules/user/entities/profile.schema';
import { IProfileRepository } from '@modules/user/repositories/profile.repository';
import { ProfileRepositoryImpl } from '@modules/user/repositories/profile.repository.impl';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Friend.name, schema: FriendSchema },
			{ name: User.name, schema: UserSchema },
			{ name: Profile.name, schema: ProfileSchema },
		]),
	],
	providers: [
		{
			provide: IProfileRepository,
			useClass: ProfileRepositoryImpl,
		},
	],
	exports: [MongooseModule, IProfileRepository],
})
export class SharedModule {}
