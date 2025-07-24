import { Module } from '@nestjs/common';
import { UserController } from '@modules/user/controllers/user.controller';
import { UserService } from '@modules/user/providers/user.service';
import { UserRepositoryImpl } from '@modules/user/repositories/user.repository.impl';
import { IUserRepository } from '@modules/user/repositories/user.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '@modules/user/entities/user.schema';
import { FileModule } from '@modules/file/file.module';
import { UserManagementController } from '@modules/user/controllers/user-management.controller';
import { FollowController } from '@modules/user/controllers/follow.controller';

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
