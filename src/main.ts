import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { IEnvVars } from '@configs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { VersioningType, ValidationPipe } from '@nestjs/common';
import { WinstonLogger } from './common/logger/winston.logger';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
		bufferLogs: true,
		logger: WinstonLogger,
	});

	const configService = app.get(ConfigService<IEnvVars>);

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}),
	);
	app.setGlobalPrefix('api');
	app.enableVersioning({
		defaultVersion: '1',
		type: VersioningType.URI,
	});
	// /api/v1

	await app.listen(configService.get('port', { infer: true })!);
}

bootstrap().catch(console.error);
