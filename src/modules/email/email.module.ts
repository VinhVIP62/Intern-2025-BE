import { Module } from '@nestjs/common';
import { EmailController } from './controllers/email.controller';
import { EmailService } from './providers/email.service';

@Module({
	controllers: [EmailController],
	providers: [EmailService],
	exports: [EmailService],
})
export class EmailModule {}
