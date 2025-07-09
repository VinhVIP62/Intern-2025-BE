import { Body, Controller, Get, Post, Query, UseGuards, Version } from '@nestjs/common';
import { FileService } from '../providers/file.service';
import { GetSignedUrlDto } from '../dto/get-signed-url.dto';
import { JwtAuthGuard } from '@common/guards';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { GetMultipleSignedUrlDto } from '../dto/get-multiple-signed-url.dto';

@ApiTags('Files')
@ApiBearerAuth() // cho Swagger UI biết cần JWT Bearer
@Controller('files')
@Throttle({ short: { limit: 5, ttl: 1000 } })
export class FileController {
	constructor(private readonly fileService: FileService) {}

	@Version('1')
	@Get('signed-url')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({
		summary: 'Lấy đường dẫn tải lên (signed URL)',
		description:
			'Tạo URL có thời hạn để upload tệp tin trực tiếp lên dịch vụ lưu trữ (cloud). Người dùng cần đăng nhập hợp lệ.',
	})
	@ApiResponse({
		status: 200,
		description: 'Signed URL được tạo thành công',
	})
	getSignedUrl(@Query() query: GetSignedUrlDto) {
		return this.fileService.generateSignedUrl(query.folder, query.filename, query.mimetype);
	}

	@Version('1')
	@Post('signed-urls')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({
		summary: 'Lấy nhiều đường dẫn signed URL',
		description: 'Tạo signed URLs để upload nhiều file. Người dùng cần đăng nhập.',
	})
	@ApiResponse({
		status: 200,
		description: 'Danh sách signed URLs được tạo thành công',
	})
	getMultipleSignedUrls(@Body() body: GetMultipleSignedUrlDto) {
		return this.fileService.generateMultipleSignedUrls(body.folder, body.files);
	}
}
