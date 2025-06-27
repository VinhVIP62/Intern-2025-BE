import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseConfig, Config } from '@configs';
import { LoggerModule } from '@common/logger/logger.module';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import path from 'path';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { GlobalExceptionFilter, CustomExceptionFilter, HttpExceptionFilter } from '@common/filters';
import { JwtAuthGuard } from '@common/guards';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { throttlerConfig } from '@configs/throttler.config';
import { SharedModule } from './shared/shared.module';
import { DatabaseModule } from '@common/database/database.module';

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
		ThrottlerModule.forRoot(throttlerConfig),
		LoggerModule,
		SharedModule,
		DatabaseModule,
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
			useClass: JwtAuthGuard,
		},
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
	],
})
export class AppModule {}
