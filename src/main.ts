import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { IEnvVars } from './configs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService<IEnvVars>);

  await app.listen(configService.get('port', { infer: true })!);
}

bootstrap().catch(console.error);
