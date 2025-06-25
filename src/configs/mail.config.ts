import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigService } from '@nestjs/config/dist/config.service';
import * as path from 'path';
import { IEnvVars } from './config';

export const mailConfig = (configService: ConfigService<IEnvVars>): MailerOptions => ({
	transport: {
		host: configService.get<string>('mail_host'),
		port: configService.get<number>('mail_port'),
		auth: {
			user: configService.get<string>('mail_user'),
			pass: configService.get<string>('mail_pass'),
		},
	},
	defaults: {
		from: '"MyApp" <no-reply@myapp.com>',
	},
	template: {
		dir: path.join(process.cwd(), 'assets', 'mail', 'templates'),
		adapter: new HandlebarsAdapter(),
		options: {
			strict: true,
		},
	},
});
