import { Module } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseConfig, Config } from '@configs';
import { LoggerModule } from '@common/logger/logger.module';
import { RouteModule } from '@router/router.module';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import path from 'path';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { GlobalExceptionFilter, CustomExceptionFilter, HttpExceptionFilter } from '@common/filters';
import { JwtAuthGuard } from '@common/guards';
import { ThrottlerGuard, ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { ResponsePagingInterceptor } from '@common/interceptors/responsePaging.interceptor';
// import { redisStore } from 'cache-manager-redis-store';
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
		ThrottlerModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService): ThrottlerModuleOptions => ({
				throttlers: [
					{
						ttl: config.get<number>('throttle_ttl') || 60,
						limit: config.get<number>('throttle_limit') || 50,
					},
				],
			}),
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
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
		{
			provide: APP_GUARD,
			useClass: JwtAuthGuard,
		},

		ResponseInterceptor,
		ResponsePagingInterceptor,
	],
})
export class AppModule {}
