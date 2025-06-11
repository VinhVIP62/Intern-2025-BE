import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { IEnvVars } from '@configs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
		bufferLogs: true,
	});

	const configService = app.get(ConfigService<IEnvVars>);

	// /api/v1

	app.setGlobalPrefix('api');
	app.enableVersioning({
		defaultVersion: '1',
		type: VersioningType.URI,
	});

	await app.listen(configService.get('port', { infer: true })!);
}

bootstrap().catch(console.error);
