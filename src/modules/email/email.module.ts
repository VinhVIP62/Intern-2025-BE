import { Module } from '@nestjs/common';
import { EmailController } from './controllers/email.controller';
import { EmailService } from './providers/email.service';
import { OtpModule } from '@modules/otp/otp.module';

@Module({
	imports: [OtpModule],
	controllers: [EmailController],
	providers: [EmailService],
	exports: [EmailService],
})
export class EmailModule {}
