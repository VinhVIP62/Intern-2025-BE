import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseConfig, Config } from '@configs';
import { LoggerModule } from '@common/logger/logger.module';
import { RouteModule } from '@router/router.module';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import path from 'path';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import {
	GlobalExceptionFilter,
	CustomExceptionFilter,
	HttpExceptionFilter,
	MongoExceptionFilter,
	MongooseExceptionFilter,
} from '@common/filters';
import { JwtAuthGuard } from '@common/guards';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ResponseTransformInterceptor } from '@common/interceptor/response-transform.interceptor';

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
		LoggerModule,
		RouteModule,
		ThrottlerModule.forRoot({
			throttlers: [
				{
					ttl: 60000,
					limit: 60,
				},
			],
			errorMessage: 'Rate limit reached',
		}),
	],
	providers: [
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
			provide: APP_FILTER,
			useClass: MongoExceptionFilter,
		},
		{
			provide: APP_FILTER,
			useClass: MongooseExceptionFilter,
		},
		{
			provide: APP_GUARD,
			useClass: JwtAuthGuard,
		},
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: ResponseTransformInterceptor,
		},
	],
})
export class AppModule {}
