import { Module } from '@nestjs/common';
import { OtpService } from './providers/otp.service';
import { OtpRepositoryImpl } from './repositories/otp.repository.impl';
import { IOtpRepository } from './repositories/otp.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Otp, OtpSchema } from './entities/otp.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Otp.name,
				schema: OtpSchema,
			},
		]),
	],
	providers: [
		OtpService,
		{
			provide: IOtpRepository,
			useClass: OtpRepositoryImpl,
		},
	],
	exports: [OtpService],
})
export class OtpModule {}
