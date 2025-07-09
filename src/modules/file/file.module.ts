import { Module } from '@nestjs/common';
import { FileController } from './controllers/file.controller';
import { FileService } from './providers/file.service';
import { GCSService } from './providers/gcs.service';

@Module({
	controllers: [FileController],
	providers: [FileService, GCSService],
	exports: [FileService], // nếu module khác cần dùng
})
export class FileModule {}
