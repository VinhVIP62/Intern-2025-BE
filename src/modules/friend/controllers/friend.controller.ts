import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Query,
	Req,
	UseGuards,
} from '@nestjs/common';
import { FriendService } from '../providers/friend.service';
import { Response } from 'src/common/decorators/response.decorator';
import { FriendDto } from '../dto/friend.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiOperation } from '@nestjs/swagger';

@Controller()
export class FriendController {
	constructor(private readonly friendService: FriendService) {}

	@Post('request')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Create a friend request' })
	@Response()
	async createFriendRequest(@Body() body: { receiverId: string }, @Req() req: any) {
		if (!body.receiverId) {
			throw new BadRequestException('Receiver ID is required');
		}
		const userId = req.user.id;
		return this.friendService.createFriendRequest(userId, body.receiverId);
	}

	@Get('requests')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Get friend requests' })
	@Response()
	async getFriendRequests(@Req() req: any) {
		const userId = req.user.id;
		return this.friendService.getFriendRequests(userId);
	}

	@Get()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Get friends' })
	@Response()
	async getFriends(@Req() req: any) {
		const userId = req.user.id;
		return this.friendService.getMyFriends(userId);
	}

	@Get('my-requests')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Get my requests' })
	@Response()
	async getMyRequests(@Req() req: any) {
		const userId = req.user.id;
		return this.friendService.getMyRequests(userId);
	}

	@Post('accept')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Accept a friend request' })
	@Response()
	async acceptFriendRequest(@Body() body: { senderId: string }, @Req() req: any) {
		const userId = req.user.id;
		return this.friendService.acceptFriendRequest(userId, body.senderId);
	}

	@Delete('cancel')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Reject a friend request' })
	@Response()
	async rejectFriendRequest(@Body() body: { senderId: string }, @Req() req: any) {
		const userId = req.user.id;
		return this.friendService.rejectFriendRequest(userId, body.senderId);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Delete a friend' })
	@Response()
	async deleteFriend(@Param('id') id: string, @Req() req: any) {
		const userId = req.user.id;
		return this.friendService.deleteFriend(userId, id);
	}
}
