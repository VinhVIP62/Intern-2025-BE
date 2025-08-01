import { Module } from '@nestjs/common';
import { UploadService } from './providers/upload.service';
import { CloudinaryProvider } from '@configs/cloudinary.config';
import { ConfigModule } from '@nestjs/config';
@Module({
	imports: [ConfigModule],
	providers: [UploadService, CloudinaryProvider],
	exports: [UploadService, CloudinaryProvider],
})
export class UploadModule {}
