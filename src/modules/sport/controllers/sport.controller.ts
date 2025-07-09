import {
	ClassSerializerInterceptor,
	Controller,
	Get,
	UseInterceptors,
	Version,
} from '@nestjs/common';
import { SportService } from '../providers/sport.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from '@common/decorators/response.decorator';
import { Public } from '@common/decorators';
import { SportResponseDto } from '../dto/sports-response.dto';

@ApiTags('Sports')
@Controller('sports')
export class SportController {
	constructor(private readonly sportService: SportService) {}

	@Version('1')
	@Get('all')
	@Public()
	@Response('response.sport.get.list')
	@UseInterceptors(ClassSerializerInterceptor)
	@ApiOperation({
		summary: 'Lấy tất cả môn thể thao',
		description: 'Trả về tất cả các môn thể thao trong hệ thống, tất cả mọi người được truy cập.',
	})
	@ApiResponse({
		status: 200,
		description: 'Danh sách môn thể thao',
		type: [SportResponseDto],
	})
	async getAll(): Promise<SportResponseDto[]> {
		return await this.sportService.getAllSports();
	}
}
