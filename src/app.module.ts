import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@infrastructure/config/config.module';
import { LoggerModule } from '@infrastructure/logger/logger.module';
import { SharedModule } from '@modules/shared.module';
import { AuthModule } from '@modules/auth.module';

@Module({
  imports: [SharedModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
