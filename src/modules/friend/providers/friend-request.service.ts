import { Injectable } from '@nestjs/common';
import { IFriendRequestRepository } from '../repositories/friend-request.repository';
import { CreateFriendRequestDto } from '../dto/create-friend-request.dto';
import { Types } from 'mongoose';
import { BadRequest } from '@common/exceptions';
import { IFriendRepository } from '../repositories/friend.repository';
import { ResponseFriendRequestDto } from '../dto/reponse-friend-request.dto';
import { plainToInstance } from 'class-transformer';
import { checkCooldown } from '@common/utils/time.util';

@Injectable()
export class FriendRequestService {
	constructor(
		private readonly friendRequestRepository: IFriendRequestRepository,
		private readonly friendRepository: IFriendRepository,
	) {}

	async sendRequest(senderId: string, dto: CreateFriendRequestDto) {
		if (senderId === dto.receiver) {
			throw new BadRequest('exception.friendRequest.cannotSendToSelf');
		}

		// Nếu đã là bạn bè
		const alreadyFriend = await this.friendRepository.isFriend(senderId, dto.receiver);
		if (alreadyFriend) {
			throw new BadRequest('exception.friendRequest.alreadyFriends');
		}

		// Nếu người kia đã gửi lời mời thì tạo bạn luôn
		const reverseRequest = await this.friendRequestRepository.findPending(dto.receiver, senderId);
		if (reverseRequest) {
			// tạo bạn bè
			await this.friendRepository.create(senderId, dto.receiver);

			// xoá 2 lời mời
			await this.friendRequestRepository.updateStatus(dto.receiver, senderId, 'accepted');
			return {};
		}

		// Nếu đã gửi trước đó rồi
		const existingRequest = await this.friendRequestRepository.findAny(senderId, dto.receiver);

		if (existingRequest) {
			if (existingRequest.status === 'pending') {
				throw new BadRequest('exception.friendRequest.alreadySent');
			}

			if (existingRequest.status === 'rejected') {
				const canResend = checkCooldown(existingRequest.updatedAt); // ví dụ 7 ngày sau mới được gửi lại
				if (!canResend) throw new BadRequest('Đã bị từ chối, không thể gửi lại ngay');

				// Hoặc update lại status
				await this.friendRequestRepository.updateStatus(senderId, dto.receiver, 'pending');
				return;
			}

			if (existingRequest.status === 'accepted') {
				throw new BadRequest('Hai người đã là bạn bè');
			}
		}

		const friendRequest = await this.friendRequestRepository.create({
			sender: new Types.ObjectId(senderId),
			receiver: new Types.ObjectId(dto.receiver),
			status: 'pending',
		});

		return friendRequest;
	}

	async getReceivedRequests(userId: string) {
		const requests = await this.friendRequestRepository.findReceivedPending(userId);
		return requests.map(req =>
			plainToInstance(ResponseFriendRequestDto, req, { excludeExtraneousValues: true }),
		);
	}

	async acceptRequest(receiverId: string, senderId: string) {
		// Kiểm tra tồn tại lời mời từ sender → receiver chưa?
		const request = await this.friendRequestRepository.findPending(senderId, receiverId);
		if (!request) {
			throw new BadRequest('exception.friendRequest.notFound');
		}

		// Tạo bạn bè 2 chiều (tuỳ cấu trúc bạn lưu)
		await this.friendRepository.create(senderId, receiverId);

		// Cập nhật trạng thái lời mời thành accepted
		await this.friendRequestRepository.updateStatus(senderId, receiverId, 'accepted');

		return {};
	}

	async rejectRequest(receiverId: string, senderId: string) {
		// Kiểm tra xem có lời mời "pending" không
		const request = await this.friendRequestRepository.findPending(senderId, receiverId);
		if (!request) {
			throw new BadRequest('exception.friendRequest.notFound');
		}

		// Cập nhật trạng thái sang "rejected"
		await this.friendRequestRepository.updateStatus(senderId, receiverId, 'rejected');
	}

	async cancelRequest(userId: string, otherUserId: string) {
		// Tìm lời mời liên quan giữa 2 user
		const request =
			(await this.friendRequestRepository.findPending(userId, otherUserId)) ??
			(await this.friendRequestRepository.findPending(otherUserId, userId));

		if (!request) {
			throw new BadRequest('exception.friendRequest.notFound');
		}

		await this.friendRequestRepository.deleteMany(userId, otherUserId);
	}
}
