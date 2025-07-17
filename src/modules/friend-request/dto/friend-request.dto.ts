import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray, IsNumber } from 'class-validator';
import { FriendRequestStatus } from '../entities/friend-request.enum';
import { BasePaginatedResponseDto } from '@common/dto/base-pagination.dto';
import { BasePaginationMetaDto } from '@common/dto/base-pagination.dto';

export class CreateFriendRequestDto {
	@ApiProperty({
		description: 'ID của người nhận lời mời kết bạn',
		example: '507f1f77bcf86cd799439011',
	})
	@IsString()
	recipientId: string;

	@ApiProperty({
		description: 'Tin nhắn kèm theo lời mời kết bạn',
		example: 'Xin chào! Tôi muốn kết bạn với bạn.',
		required: false,
	})
	@IsOptional()
	@IsString()
	message?: string;
}

export class FriendRequestResponseDto {
	@ApiProperty({
		description: 'ID của lời mời kết bạn',
		example: '507f1f77bcf86cd799439011',
	})
	_id: string;

	@ApiProperty({
		description: 'ID của người gửi lời mời',
		example: '507f1f77bcf86cd799439011',
	})
	sender: string;

	@ApiProperty({
		description: 'Thông tin người gửi lời mời',
		example: {
			_id: '507f1f77bcf86cd799439011',
			fullName: 'Nguyen Van A',
			avatar: 'https://example.com/avatar.jpg',
			username: 'nguyenvana',
		},
	})
	senderUser: {
		_id: string;
		fullName: string;
		avatar: string;
		username: string;
	};

	@ApiProperty({
		description: 'ID của người nhận lời mời',
		example: '507f1f77bcf86cd799439012',
	})
	recipient: string;

	@ApiProperty({
		description: 'Thông tin người nhận lời mời',
		example: {
			_id: '507f1f77bcf86cd799439012',
			fullName: 'Tran Thi B',
			avatar: 'https://example.com/avatar2.jpg',
			username: 'tranthib',
		},
	})
	recipientUser: {
		_id: string;
		fullName: string;
		avatar: string;
		username: string;
	};

	@ApiProperty({
		description: 'Trạng thái lời mời kết bạn',
		enum: FriendRequestStatus,
		example: FriendRequestStatus.PENDING,
	})
	status: FriendRequestStatus;

	@ApiProperty({
		description: 'Tin nhắn kèm theo lời mời kết bạn',
		example: 'Xin chào! Tôi muốn kết bạn với bạn.',
		required: false,
	})
	message?: string;

	@ApiProperty({
		description: 'Thời gian tạo lời mời kết bạn',
		example: '2024-01-01T00:00:00.000Z',
	})
	createdAt: Date;

	@ApiProperty({
		description: 'Thời gian cập nhật lời mời kết bạn',
		example: '2024-01-01T00:00:00.000Z',
	})
	updatedAt: Date;
}

export class PaginatedFriendRequestsResponseDto extends BasePaginationMetaDto {
	@ApiProperty({
		description: 'Danh sách lời mời kết bạn',
		type: [FriendRequestResponseDto],
	})
	friendRequests: FriendRequestResponseDto[];
}

export class FriendshipStatusResponseDto {
	@ApiProperty({
		description: 'ID của người dùng hiện tại',
		example: '507f1f77bcf86cd799439011',
	})
	currentUserId: string;

	@ApiProperty({
		description: 'ID của người dùng cần kiểm tra',
		example: '507f1f77bcf86cd799439012',
	})
	targetUserId: string;

	@ApiProperty({
		description: 'Hai người dùng có phải là bạn bè hay không',
		example: true,
	})
	areFriends: boolean;

	@ApiProperty({
		description: 'Trạng thái lời mời kết bạn (nếu có)',
		enum: FriendRequestStatus,
		example: FriendRequestStatus.PENDING,
		required: false,
	})
	friendRequestStatus?: FriendRequestStatus;

	@ApiProperty({
		description: 'ID của lời mời kết bạn (nếu có)',
		example: '507f1f77bcf86cd799439011',
		required: false,
	})
	friendRequestId?: string;

	@ApiProperty({
		description: 'Tin nhắn kèm theo lời mời kết bạn (nếu có)',
		example: 'Xin chào! Tôi muốn kết bạn với bạn.',
		required: false,
	})
	friendRequestMessage?: string;

	@ApiProperty({
		description: 'Thông tin người dùng hiện tại',
		example: {
			_id: '507f1f77bcf86cd799439011',
			fullName: 'Nguyen Van A',
			avatar: 'https://example.com/avatar.jpg',
		},
		required: false,
	})
	currentUser?: {
		_id: string;
		fullName: string;
		avatar: string;
	};

	@ApiProperty({
		description: 'Thông tin người dùng cần kiểm tra',
		example: {
			_id: '507f1f77bcf86cd799439012',
			fullName: 'Tran Thi B',
			avatar: 'https://example.com/avatar2.jpg',
		},
		required: false,
	})
	targetUser?: {
		_id: string;
		fullName: string;
		avatar: string;
	};

	@ApiProperty({ description: 'Bạn đã follow người này chưa', example: false })
	isFollowing: boolean;
}

export class FriendResponseDto {
	@ApiProperty({
		description: 'ID của người dùng',
		example: '507f1f77bcf86cd799439011',
	})
	_id: string;

	@ApiProperty({
		description: 'Họ và tên',
		example: 'Nguyen Van A',
	})
	fullName: string;

	@ApiProperty({
		description: 'Avatar',
		example: 'https://example.com/avatar.jpg',
		required: false,
	})
	avatar?: string;

	@ApiProperty({
		description: 'Email',
		example: 'nguyenvana@example.com',
	})
	email: string;

	@ApiProperty({
		description: 'Username',
		example: 'nguyenvana',
		required: false,
	})
	username?: string;

	@ApiProperty({
		description: 'Bio',
		example: 'I love sports!',
		required: false,
	})
	bio?: string;

	@ApiProperty({
		description: 'Môn thể thao yêu thích',
		example: ['football', 'basketball'],
		required: false,
	})
	favoritesSports?: string[];
}

export class PaginatedFriendsResponseDto extends BasePaginationMetaDto {
	@ApiProperty({
		description: 'Danh sách bạn bè',
		type: [FriendResponseDto],
	})
	friends: FriendResponseDto[];
}

export class MutualFriendsResponseDto extends BasePaginationMetaDto {
	@ApiProperty({
		description: 'ID của người dùng hiện tại',
		example: '507f1f77bcf86cd799439011',
	})
	currentUserId: string;

	@ApiProperty({
		description: 'ID của người dùng cần kiểm tra',
		example: '507f1f77bcf86cd799439012',
	})
	targetUserId: string;

	@ApiProperty({
		description: 'Danh sách bạn bè chung',
		type: [FriendResponseDto],
	})
	mutualFriends: FriendResponseDto[];
}
