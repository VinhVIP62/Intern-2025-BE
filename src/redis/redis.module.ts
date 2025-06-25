import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { ConfigModule } from '@nestjs/config/dist/config.module';

@Global()
@Module({
	imports: [ConfigModule],
	providers: [RedisService],
	exports: [RedisService],
})
export class RedisModule {}
