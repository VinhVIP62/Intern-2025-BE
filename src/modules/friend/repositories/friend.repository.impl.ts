import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FriendReq } from '@modules/friend/entities/friend-req.schema';
import { Model } from 'mongoose';
import { IFriendRepository } from './friend.repository';
import { FriendPaginationDto } from '../dto/response/friend.Pagination.dto';
import { User } from '@modules/user/entities/user.schema';
import { FriendStatus } from '@modules/friend/enum/friendStatus.enum';
import { FriendDto } from '@modules/friend/dto/response/friend.dto';

@Injectable()
export class FriendRepositoryImpl implements IFriendRepository {
	constructor(
		@InjectModel(FriendReq.name)
		private friendReqModel: Model<FriendReq>,
	) {}

	async create(data: Partial<FriendReq>): Promise<FriendReq> {
		return await this.friendReqModel.create(data);
	}

	async find(query: any): Promise<FriendReq[]> {
		return this.friendReqModel.find(query).exec();
	}
	async findOne(query: any, isSender: boolean): Promise<FriendDto | null> {
		const friend = await this.friendReqModel
			.findOne(query)
			.populate<{ sender: User }>('sender')
			.populate<{ receiver: User }>('receiver')
			.exec();
		if (!friend) {
			return null;
		}
		// isSender to return receiver info
		if (isSender) {
			return {
				id: friend._id.toString(),
				sender: friend.sender._id.toString(),
				receiver: friend.receiver._id.toString(),
				status: friend.status,
				createdAt: friend.createdAt,
				userInfo: {
					id: friend.receiver._id.toString(),
					fullName: friend.receiver.fullName || '',
					avatar: friend.receiver.avatar || '',
					description: friend.receiver.description || '',
				},
			};
		}
		// not isSender to return sender info
		return {
			id: friend._id.toString(),
			sender: friend.sender._id.toString(),
			receiver: friend.receiver._id.toString(),
			status: friend.status,
			createdAt: friend.createdAt,
			userInfo: {
				id: friend.sender._id.toString(),
				fullName: friend.sender.fullName || '',
				avatar: friend.sender.avatar || '',
				description: friend.sender.description || '',
			},
		};
	}

	async findUserFriends(userId: string, page: number, limit: number): Promise<FriendPaginationDto> {
		const query = {
			$or: [
				{ sender: userId, status: FriendStatus.ACCEPTED },
				{ receiver: userId, status: FriendStatus.ACCEPTED },
			],
		};
		const friends = await this.friendReqModel
			.find(query)
			.populate<{ sender: User }>('sender')
			.populate<{ receiver: User }>('receiver')
			.skip((page - 1) * limit)
			.limit(limit)
			.exec();
		const total = await this.friendReqModel.countDocuments(query);
		const totalPages = Math.ceil(total / limit);
		const hasNextPage = page < totalPages;
		const hasPreviousPage = page > 1;
		// console.log('find user friend', userId);
		//debug tostring with undefine or null
		// console.log(friends);

		return {
			users: friends.map(friend =>
				friend.sender._id.toString() === userId ?
					{
						id: friend.receiver._id.toString(),
						fullName: friend.receiver.fullName || '',
						avatar: friend.receiver.avatar || '',
						createdAt: friend.createdAt,
						description: friend.receiver.description || '',
					}
				:	{
						id: friend.sender._id.toString(),
						fullName: friend.sender.fullName || '',
						avatar: friend.sender.avatar || '',
						createdAt: friend.createdAt,
						description: friend.sender.description || '',
					},
			),
			pagination: {
				total,
				page,
				limit,
				totalPages,
				hasNextPage,
				hasPreviousPage,
			},
		};
	}

	async findUserRequests(query: any, page: number, limit: number): Promise<FriendPaginationDto> {
		const requests = await this.friendReqModel
			.find(query)
			.populate<{ sender: User }>('sender')
			.populate<{ receiver: User }>('receiver')
			.skip((page - 1) * limit)
			.limit(limit)
			.exec();
		const total = await this.friendReqModel.countDocuments(query);
		const totalPages = Math.ceil(total / limit);
		const hasNextPage = page < totalPages;
		const hasPreviousPage = page > 1;

		return {
			users: requests.map(request =>
				query.sender === null || query.sender === undefined ?
					{
						id: request.sender._id.toString(),
						fullName: request.sender.fullName || '',
						avatar: request.sender.avatar || '',
						createdAt: request.createdAt,
						description: request.sender.description || '',
					}
				:	{
						id: request.receiver._id.toString(),
						fullName: request.receiver.fullName || '',
						avatar: request.receiver.avatar || '',
						createdAt: request.createdAt,
						description: request.receiver.description || '',
					},
			),
			pagination: {
				total,
				page,
				limit,
				totalPages,
				hasNextPage,
				hasPreviousPage,
			},
		};
	}
	async update(
		idUser: string,
		idFriend: string,
		data: Partial<FriendReq>,
	): Promise<FriendDto | null> {
		const friend = await this.friendReqModel
			.findOneAndUpdate(
				{
					$or: [
						{ sender: idUser, receiver: idFriend },
						{ sender: idFriend, receiver: idUser },
					],
				},
				data,
				{ new: true },
			)
			.populate<{ sender: User }>('sender')
			.populate<{ receiver: User }>('receiver')
			.exec();
		if (!friend) {
			return null;
		}
		return {
			id: friend._id.toString(),
			sender: friend.sender._id.toString(),
			receiver: friend.receiver._id.toString(),
			status: friend.status,
			createdAt: friend.createdAt,
			userInfo: {
				id: friend.sender._id.toString(),
				fullName: friend.sender.fullName || '',
				avatar: friend.sender.avatar || '',
				description: friend.sender.description || '',
			},
		};
	}

	async delete(idUser: string, idFriend: string): Promise<void> {
		await this.friendReqModel
			.deleteOne({
				$or: [
					{
						sender: idUser,
						receiver: idFriend,
					},
					{
						sender: idFriend,
						receiver: idUser,
					},
				],
			})
			.exec();
	}
}
