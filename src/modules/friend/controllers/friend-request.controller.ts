import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	Req,
	UseInterceptors,
	Version,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FriendRequestService } from '../providers/friend-request.service';
import { CreateFriendRequestDto } from '../dto/create-friend-request.dto';
import { Request } from 'express';
import { Response } from '@common/decorators/response.decorator';
import { ResponseFriendRequestDto } from '../dto/reponse-friend-request.dto';
import { FriendRequestAction, UpdateFriendRequestDto } from '../dto/update-friend-request.dto';

@ApiTags('Friend Request')
@Controller('friend-requests')
export class FriendRequestController {
	constructor(private readonly friendRequestService: FriendRequestService) {}

	@Version('1')
	@Post()
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Gửi lời mời kết bạn' })
	@ApiResponse({ status: 200, description: 'Gửi lời mời kết bạn thành công' })
	@Response('response.friend.friendRequest.send')
	async sendFriendRequest(@Req() req: Request, @Body() dto: CreateFriendRequestDto) {
		const friendRequest = await this.friendRequestService.sendRequest(req.user!.id, dto);
		return friendRequest;
	}

	@Version('1')
	@Get('received')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Lấy danh sách lời mời kết bạn đến mình' })
	@ApiResponse({
		status: 200,
		description: 'Danh sách lời mời kết bạn',
		type: [ResponseFriendRequestDto],
	})
	@Response('response.friend.friendRequest.receivedList')
	@UseInterceptors(ClassSerializerInterceptor)
	async getReceivedRequests(@Req() req: Request) {
		const friendRequests = await this.friendRequestService.getReceivedRequests(req.user!.id);

		return friendRequests;
	}

	@Version('1')
	@Patch(':senderId/respond')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Phản hồi lời mời kết bạn (chấp nhận / từ chối)' })
	@ApiParam({ name: 'senderId', description: 'ID người đã gửi lời mời', type: String })
	@ApiResponse({ status: 200, description: 'Phản hồi lời mời thành công' })
	@Response('response.friend.friendRequest.respond')
	async respondToFriendRequest(
		@Req() req: Request,
		@Param('senderId') senderId: string,
		@Body() dto: UpdateFriendRequestDto,
	) {
		const { action } = dto;

		if (action === FriendRequestAction.ACCEPT) {
			await this.friendRequestService.acceptRequest(req.user!.id, senderId);
		} else if (action === FriendRequestAction.REJECT) {
			await this.friendRequestService.rejectRequest(req.user!.id, senderId);
		}

		return {};
	}

	@Version('1')
	@Patch(':receiverId/cancel')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Huỷ lời mời kết bạn đã gửi hoặc nhận (xoá lời mời)' })
	@ApiParam({ name: 'receiverId', description: 'ID người nhận lời mời', type: String })
	@ApiResponse({ status: 200, description: 'Xoá lời mời kết bạn thành công' })
	@Response('response.friend.friendRequest.cancel')
	async cancelFriendRequest(@Req() req: Request, @Param('receiverId') receiverId: string) {
		await this.friendRequestService.cancelRequest(req.user!.id, receiverId);
		return {};
	}
}
