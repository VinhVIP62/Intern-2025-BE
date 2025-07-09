import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './providers/user.service';
import { UserRepositoryImpl } from './repositories/user.repository.impl';
import { IUserRepository } from './repositories/user.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.schema';
import { UploadModule } from '../../shared/upload/upload.module';
import { VerificationModule } from 'src/shared/verification/verification.module';
import { Otp, OtpSchema } from 'src/shared/verification/entities/otp.schema';
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
