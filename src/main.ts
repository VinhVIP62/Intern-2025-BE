import { NestFactory } from '@nestjs/core';
import { AppModule } from '@src/app.module';
import { WinstonLoggerService } from '@infrastructure/logger/winston.logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new WinstonLoggerService(),
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
