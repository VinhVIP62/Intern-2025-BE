import { ResponseEntity } from '@common/types';
import { Controller, Get, Post, Body, Req, Param, Delete } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Version } from '@nestjs/common/decorators/core/version.decorator';
import { Response } from '@common/decorators/response.decorator';
import { FriendService } from '../providers/friend.service';
import { ResponseFriendRequestDto, SendFriendRequestDto } from '../dto/friend.dto';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('Friends')
@Controller({
	path: 'friends',
	version: '1',
})
export class FriendController {
	constructor(private readonly friendService: FriendService) {}

	@Post('request')
	@Version('1')
	@ApiOperation({ summary: 'Gửi lời mời kết bạn' })
	@ApiResponse({ status: 201, description: 'Gửi lời mời kết bạn thành công' })
	@Response()
	async sendRequest(
		@Req() req: Request,
		@Body() dto: SendFriendRequestDto,
	): Promise<ResponseEntity<any>> {
		const user = req.user as { id: string };
		const result = await this.friendService.sendRequest(user.id, dto.toUserId);
		return {
			success: true,
			data: result,
		};
	}

	@Post('respond')
	@Version('1')
	@ApiOperation({ summary: 'Phản hồi lời mời kết bạn' })
	@ApiResponse({ status: 200, description: 'Phản hồi lời mời thành công' })
	@Response()
	async respondRequest(
		@Req() req: Request,
		@Body() dto: ResponseFriendRequestDto,
	): Promise<ResponseEntity<any>> {
		const user = req.user as { id: string };
		const result = await this.friendService.respondRequest(user.id, dto.fromUserId, dto.response);
		return {
			success: true,
			data: result,
		};
	}

	@Delete('friend/:friendId')
	@Version('1')
	@Response()
	async deleteFriend(
		@Req() req: Request,
		@Param('friendId') friendId: string,
	): Promise<ResponseEntity<any>> {
		const user = req.user as { id: string };
		const res = await this.friendService.deleteFriend(user.id, friendId);
		return {
			success: true,
			data: res,
		};
	}

	@Get()
	@Version('1')
	@ApiOperation({ summary: 'Lấy danh sách bạn bè của tôi' })
	@ApiResponse({ status: 200, description: 'Trả về danh sách bạn bè' })
	@Response()
	async getMyFriends(@Req() req: Request): Promise<ResponseEntity<any>> {
		const user = req.user as { id: string };
		const friends = await this.friendService.getFriends(user.id);
		return {
			success: true,
			data: friends,
		};
	}

	@Get('pendinglist')
	@Version('1')
	@Response()
	async pendingList(@Req() req: Request): Promise<ResponseEntity<any>> {
		const user = req.user as { id: string };
		const friends = await this.friendService.getPendingList(user.id);
		return {
			success: true,
			data: friends,
		};
	}

	@Get('friendlist/:userId')
	@Version('1')
	@Response()
	async getFriendList(
		@Req() request: Request,
		@Param('userId') userId: string,
	): Promise<ResponseEntity<any>> {
		const myId = request.user as { id: string };
		const friendList = await this.friendService.getFriendList(myId.id, userId);
		return {
			success: true,
			data: friendList,
		};
	}

	@Get('isfriend/:friendId')
	@Version('1')
	@Response()
	async isFriend(
		@Req() req: Request,
		@Param('friendId') friendId: string,
	): Promise<ResponseEntity<any>> {
		const user = req.user as { id: string };
		const isFriend = await this.friendService.isFriend(user.id, friendId);
		return {
			success: true,
			data: isFriend,
		};
	}
}
