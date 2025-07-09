import { Response } from '@common/decorators/response.decorator';
import { Controller, Delete, Get, Param, Req, Version } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { FriendService } from '../providers/friend.service';
import { ResponseFriendDto } from '../dto/reponse-friend.dto';

@ApiTags('Friend')
@Controller('friends')
export class FriendController {
	constructor(private readonly friendService: FriendService) {}

	@Version('1')
	@Get()
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Lấy danh sách bạn bè' })
	@ApiResponse({
		status: 200,
		description: 'Lấy danh sách bạn bè thành công',
		type: ResponseFriendDto,
		isArray: true,
	})
	@Response('response.friend.list.success')
	async getFriends(@Req() req: Request) {
		const friends = await this.friendService.getFriends(req.user!.id);
		return friends;
	}

	@Version('1')
	@Delete(':friendId')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Hủy kết bạn với người dùng' })
	@ApiParam({ name: 'friendId', description: 'ID của người cần hủy kết bạn', type: String })
	@ApiResponse({ status: 200, description: 'Hủy kết bạn thành công' })
	@Response('response.friend.unfriend.success')
	async unfriend(@Req() req: Request, @Param('friendId') friendId: string) {
		await this.friendService.unfriend(req.user!.id, friendId);
		return {};
	}
}
