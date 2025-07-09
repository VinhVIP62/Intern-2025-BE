import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './providers/user.service';
import { UserRepositoryImpl } from './repositories/user.repository.impl';
import { IUserRepository } from './repositories/user.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.schema';
import { SportModule } from '@modules/sport/sport.module';
import { FileModule } from '@modules/file/file.module';
import { LoggerModule } from '@common/logger/logger.module';
import { ElasticModule } from '@modules/elastic/elastic.module';
import { FriendModule } from '@modules/friend/friend.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: User.name,
				schema: UserSchema,
			},
		]),
		SportModule,
		FileModule,
		LoggerModule,
		ElasticModule,
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
	exports: [UserService],
})
export class UserModule {}
