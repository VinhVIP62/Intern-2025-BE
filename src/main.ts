import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { IEnvVars } from '@configs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { VersioningType } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { AppLoggerService } from '@common/logger/logger.service';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';

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

	const swaggerConfig = new DocumentBuilder()
		.setTitle('API Documentation')
		.setDescription('Swagger docs for the project')
		.setVersion('1.0')
		.addBearerAuth()
		.build();

	const document = SwaggerModule.createDocument(app, swaggerConfig);
	SwaggerModule.setup('api-docs', app, document);

	fs.writeFileSync('./openapi.json', JSON.stringify(document, null, 2));

	app.enableCors({
		origin: configService.get('cors') || '*',
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
		allowedHeaders: 'Content-Type, Accept, Authorization',
		credentials: true,
	});

	await app.listen(configService.get('port', { infer: true })!);
}

bootstrap().catch(console.error);
