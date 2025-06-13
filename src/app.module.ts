import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseConfig, Config } from '@configs';
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
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { GlobalExceptionFilter, CustomExceptionFilter, HttpExceptionFilter } from '@common/filters';
import { JwtAuthGuard } from '@common/guards';

@Module({
	imports: [
		ConfigModule.forRoot({
			expandVariables: true,
			cache: true,
			isGlobal: true,
			load: [Config],
		}),
		MongooseModule.forRootAsync({
			inject: [ConfigService],
			useFactory: DatabaseConfig,
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
			useClass: GlobalExceptionFilter,
		},
		{
			provide: APP_FILTER,
			useClass: CustomExceptionFilter,
		},
		{
			provide: APP_FILTER,
			useClass: HttpExceptionFilter,
		},
		{
			provide: APP_GUARD,
			useClass: JwtAuthGuard,
		},
	],
})
export class AppModule {}
