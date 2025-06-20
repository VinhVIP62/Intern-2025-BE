import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { IEnvVars } from '@configs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { VersioningType } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { AppLoggerService } from '@common/logger/logger.service';
import * as swaggerUi from 'swagger-ui-express';
import * as path from 'path';
import * as fs from 'fs';
import { OpenAPIObject } from '@nestjs/swagger';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
		bufferLogs: true,
	});

	const logger = app.get(AppLoggerService);
	app.useLogger(logger);

	const configService = app.get(ConfigService<IEnvVars>);

	// /api/v1

	app.setGlobalPrefix('api');
	app.enableVersioning({
		defaultVersion: '1',
		type: VersioningType.URI,
	});

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}),
	);

	// CORS config
	app.enableCors();

	// serve my own doc in a separate file without auto genning
	const openApiSpecPath = path.join(__dirname, '../openapi.json');
	const openApiDocument = JSON.parse(fs.readFileSync(openApiSpecPath, 'utf8')) as OpenAPIObject;
	app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

	await app.listen(configService.get('port', { infer: true })!);
}

bootstrap().catch(console.error);
