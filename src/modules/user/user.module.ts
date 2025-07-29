import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './providers/user.service';
import { UserRepositoryImpl } from './repositories/implements/user.repository.impl';
import { IUserRepository } from './repositories/interfaces/user.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.schema';
import { ProfileService } from './providers/profile.service';
import { ProfileRepositoryImpl } from './repositories/implements/profile.repository.impl';
import { IProfileRepository } from './repositories/interfaces/profile.repository';
import { Profile } from './entities/profile.schema';
import { ProfileSchema } from './entities/profile.schema';
import { ProfileController } from './controllers/profile.controller';
import { ProfileMapper } from './mapper/profile.mapper';
import { SearchModule } from '@modules/search/search.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: User.name,
				schema: UserSchema,
			},
			{
				name: Profile.name,
				schema: ProfileSchema,
			},
		]),
		SearchModule,
	],
	controllers: [UserController, ProfileController],
	providers: [
		UserService,
		{
			provide: IUserRepository,
			useClass: UserRepositoryImpl,
		},
		ProfileService,
		{
			provide: IProfileRepository,
			useClass: ProfileRepositoryImpl,
		},
		ProfileMapper,
	],
	exports: [UserService, ProfileService],
})
export class UserModule {}
