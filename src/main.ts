import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { IEnvVars } from '@configs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { VersioningType } from '@nestjs/common';
import { WinstonLogger } from './common/logger/winston.logger';
import { GlobalExceptionFilter } from '@common/filters/all-exceptions.filters';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
		bufferLogs: true,
		logger: WinstonLogger,
	});

	const configService = app.get(ConfigService<IEnvVars>);

	// /api/v1

	app.setGlobalPrefix('api');
	app.enableVersioning({
		defaultVersion: '1',
		type: VersioningType.URI,
	});

	app.useGlobalFilters(new GlobalExceptionFilter());

	app.useGlobalPipes(new ValidationPipe({
		whitelist: true,
		forbidNonWhitelisted: true,
		transform: true,
  	}));

	await app.listen(configService.get('port', { infer: true })!);
}

bootstrap().catch(console.error);
