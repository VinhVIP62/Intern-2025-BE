import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { mailConfig } from '@configs/mail.config';
import { MailService } from './providers/mail.service';
import { ConfigService } from '@nestjs/config';

@Module({
	imports: [
		MailerModule.forRootAsync({
			inject: [ConfigService],
			useFactory: mailConfig,
		}),
	],
	providers: [MailService],
	exports: [MailService],
})
export class MailModule {}
