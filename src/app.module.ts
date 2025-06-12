import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { mongooseConfig } from './configs/database.config';
import config from '@configs/config';
import {
	AuthModule,
	AdminModule,
	EventModule,
	NotificationModule,
	PostModule,
	UserModule,
} from './modules';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import path from 'path';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from '@common/filters/all-exceptions.filters';

@Module({
	imports: [
		ConfigModule.forRoot({
			expandVariables: true,
			cache: true,
			isGlobal: true,
			load: [config],
		}),
		MongooseModule.forRootAsync({
			inject: [ConfigService],
			useFactory: mongooseConfig,
		}),
		I18nModule.forRoot({
			fallbackLanguage: 'en',
			loaderOptions: {
				path: path.join(__dirname, '/i18n/'),
				watch: true,
			},
			resolvers: [{ use: QueryResolver, options: ['lang'] }, AcceptLanguageResolver],
		}),
		AuthModule,
		AdminModule,
		EventModule,
		NotificationModule,
		PostModule,
		UserModule,
	],
	providers: [
		AppService,
		{
			provide: APP_FILTER,
			useClass: GlobalExceptionFilter, // Let NestJS inject I18nService
		},
	],
})
export class AppModule {}
