import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './providers/user.service';
import { UserRepositoryImpl } from './repositories/user.repository.impl';
import { IUserRepositoryToken } from './repositories/user.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.schema';
import { FileHostModule } from 'src/shared/modules/file-host/file-host.module';
import { FileHostService } from 'src/shared/modules/file-host/provider/file-host.service';
import { AuthModule } from '@modules/auth/auth.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: User.name,
				schema: UserSchema,
			},
		]),
		FileHostModule,
		forwardRef(() => AuthModule),
	],
	controllers: [UserController],
	providers: [
		UserService,
		FileHostService,
		{
			provide: IUserRepositoryToken,
			useClass: UserRepositoryImpl,
		},
	],
	exports: [UserService],
})
export class UserModule {}
