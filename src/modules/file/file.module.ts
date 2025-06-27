import { Module } from '@nestjs/common';
import { FileService } from './providers/file.service';
import { FileController } from './controllers/file.controller';

@Module({
	providers: [FileService],
	controllers: [FileController],
	exports: [FileService],
})
export class FileModule {}
