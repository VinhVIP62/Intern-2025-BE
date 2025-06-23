import { Module } from '@nestjs/common';
import { verificationService } from './providers/verification.service';
import { Otp, OtpSchema } from './entities/otp.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '@modules/user/user.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Otp.name,
				schema: OtpSchema,
			},
		]),
		UserModule,
	],
	providers: [verificationService],
	exports: [verificationService],
})
export class VerificationModule {}
