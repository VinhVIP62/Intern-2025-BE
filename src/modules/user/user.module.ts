import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './providers/user.service';
import { UserRepositoryImpl } from './repositories/user.repository.impl';
import { IUserRepository } from './repositories/user.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.schema';
import { UploadModule } from '../upload/upload.module';
import { VerificationModule } from '@modules/verification/verification.module';
import { FriendModule } from '../friend/friend.module';
@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: User.name,
				schema: UserSchema,
			},
		]),
		UploadModule,
		forwardRef(() => VerificationModule),
		forwardRef(() => FriendModule),
	],
	controllers: [UserController],
	providers: [
		UserService,
		{
			provide: IUserRepository,
			useClass: UserRepositoryImpl,
		},
	],
	exports: [
		UserService,
		{
			provide: IUserRepository,
			useClass: UserRepositoryImpl,
		},
	],
})
export class UserModule {}
