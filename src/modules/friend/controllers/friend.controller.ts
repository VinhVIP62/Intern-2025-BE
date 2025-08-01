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
import { FriendService } from '@modules/friend/providers/friend.service';
import { Response } from '@common/decorators/response.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaginationQuery } from '@common/decorators/paginationQuery.decorator';
import { Request } from 'express';

@Controller()
export class FriendController {
	constructor(private readonly friendService: FriendService) {}

	@Post('request')
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Create a friend request' })
	@Response()
	async createFriendRequest(@Body() body: { receiverId: string }, @Req() req: Request) {
		if (!body.receiverId) {
			throw new BadRequestException('Receiver ID is required');
		}
		const userId = (req.user as any).id;
		return this.friendService.createFriendRequest(userId, body.receiverId);
	}

	@Get('requests')
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Get friend requests' })
	@Response()
	async getFriendRequests(
		@Req() req: Request,
		@PaginationQuery() paginationQuery: { page: number; limit: number },
	) {
		const userId = (req.user as any).id;

		return this.friendService.getFriendRequests(
			userId,
			paginationQuery.page,
			paginationQuery.limit,
		);
	}

	@Get()
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Get friends' })
	@Response()
	async getFriends(
		@Req() req: Request,
		@PaginationQuery() paginationQuery: { page: number; limit: number },
	) {
		const userId = (req.user as any).id;
		return this.friendService.getFriends(userId, paginationQuery.page, paginationQuery.limit);
	}

	@Get('my-requests')
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Get my requests' })
	@Response()
	async getMyRequests(
		@Req() req: Request,
		@PaginationQuery() paginationQuery: { page: number; limit: number },
	) {
		const userId = (req.user as any).id;
		return this.friendService.getMyRequests(userId, paginationQuery.page, paginationQuery.limit);
	}

	@Post('accept')
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Accept a friend request' })
	@Response()
	async acceptFriendRequest(@Body() body: { senderId: string }, @Req() req: Request) {
		const userId = (req.user as any).id;
		return this.friendService.acceptFriendRequest(userId, body.senderId);
	}

	@Delete('cancel')
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Reject a friend request' })
	@Response()
	async rejectFriendRequest(@Body() body: { senderId: string }, @Req() req: Request) {
		const userId = (req.user as any).id;
		return this.friendService.rejectFriendRequest(userId, body.senderId);
	}
	@Get(':id')
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Get friend of user' })
	@Response()
	async getFriendOfUser(
		@Req() req: Request,
		@PaginationQuery() paginationQuery: { page: number; limit: number },
		@Param('id') id: string,
	) {
		return this.friendService.getFriends(id, paginationQuery.page, paginationQuery.limit);
	}

	@Delete(':id')
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Delete a friend' })
	@Response()
	async deleteFriend(@Param('id') id: string, @Req() req: Request) {
		const userId = (req.user as any).id;
		return this.friendService.deleteFriend(userId, id);
	}
}
