import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseConfig, Config } from '@configs';
import { LoggerModule } from '@common/logger/logger.module';
import { RouteModule } from '@router/router.module';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import path from 'path';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalExceptionFilter, CustomExceptionFilter, HttpExceptionFilter } from '@common/filters';
import { GlobalGuard } from '@common/guards';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerConfig } from '@configs/throttler.config';
import { ResponseCompositeInterceptor } from '@common/interceptors/response-composite.interceptor';
import { ThrottlerGuard as CustomThrottlerGuard } from './common/guards/throttler.guard';
import { I18nValidationExceptionFilter } from '@common/filters/i18n-validation-exception.filter';
import { LoggerMiddleware } from '@common/middleware/logger.middleware';
import { OptionalJwtMiddleware } from '@common/middleware/optional-jwt.middleware';
import { JwtModule } from '@nestjs/jwt';
import { ElasticModule } from '@modules/elastic/elastic.module';
import { RealtimeModule } from '@modules/realtime/realtime.module';

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
			fallbackLanguage: 'vi',
			loaderOptions: {
				path: path.join(__dirname, '/i18n/'),
				watch: true,
			},
			resolvers: [{ use: QueryResolver, options: ['lang'] }, AcceptLanguageResolver],
		}),
		JwtModule.register({}),
		ThrottlerModule.forRootAsync(ThrottlerConfig),
		ElasticModule,
		LoggerModule,
		RealtimeModule,
		RouteModule,
	],
	providers: [
		CustomThrottlerGuard,
		GlobalGuard,
		OptionalJwtMiddleware,
		{
			provide: APP_FILTER,
			useClass: GlobalExceptionFilter,
		},
		{
			provide: APP_FILTER,
			useClass: HttpExceptionFilter,
		},
		{
			provide: APP_FILTER,
			useClass: CustomExceptionFilter,
		},
		{
			provide: APP_FILTER,
			useClass: I18nValidationExceptionFilter,
		},
		{
			provide: APP_GUARD,
			useClass: GlobalGuard,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: ResponseCompositeInterceptor,
		},
	],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(LoggerMiddleware).forRoutes('*');
	}
}
