import { NestFactory } from '@nestjs/core';
import { AppModule } from '@src/app.module';
import { WinstonLoggerService } from '@infrastructure/logger/winston.logger.service';
import { VersioningType, RequestMethod } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new WinstonLoggerService(),
  });

  // Enable versioning
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
    defaultVersion: '1',
  });

  // Set global prefix
  app.setGlobalPrefix('api', {
    exclude: [{ path: '/', method: RequestMethod.GET }],
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
