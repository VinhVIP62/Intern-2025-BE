import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './providers/user.service';
import { UserRepositoryImpl } from './repositories/user.repository.impl';
import { IUserRepository } from './repositories/user.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.schema';
import { FileModule } from '../file/file.module';
import { UserManagementController } from './controllers/user-management.controller';
import { FollowController } from './controllers/follow.controller';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: User.name,
				schema: UserSchema,
			},
		]),
		FileModule,
	],
	controllers: [UserController, UserManagementController, FollowController],
	providers: [
		UserService,
		{
			provide: IUserRepository,
			useClass: UserRepositoryImpl,
		},
	],
	exports: [UserService],
})
export class UserModule {}
