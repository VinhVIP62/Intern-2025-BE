import { Module } from '@nestjs/common';
import { DevController } from './controllers/dev.controller';

@Module({
	controllers: [DevController],
})
export class DevModule {}
