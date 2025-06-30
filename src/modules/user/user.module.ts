import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NestjsFormDataModule } from 'nestjs-form-data';

import { AuthModule } from '@modules/auth';

import { FileHostModule, FileHostService } from '@shared/modules/file-host';

import { UserController } from './controllers';
import { User, UserSchema } from './entities';
import { UserService } from './providers';
import { IUserRepositoryToken } from './repositories/user.repository';
import { UserRepositoryImpl } from './repositories/user.repository.impl';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: User.name,
				schema: UserSchema,
			},
		]),
		NestjsFormDataModule,
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
