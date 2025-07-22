import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IGroupRepository } from './group.repository';
import { Group } from '../entities/group.schema';
import {
	CreateGroupDto,
	UpdateGroupDto,
	PaginatedGroupsResponseDto,
	GroupResponseDto,
	PaginatedSimpleGroupsResponseDto,
	SimpleGroupResponseDto,
} from '../dto/group.dto';
import { SportType } from '@modules/user/enums/user.enum';
import { User } from '../../user/entities/user.schema';

@Injectable()
export class GroupRepositoryImpl implements IGroupRepository {
	constructor(
		@InjectModel(Group.name) private readonly groupModel: Model<Group>,
		@InjectModel('Post') private readonly postModel: Model<any>,
		@InjectModel(User.name) private readonly userModel: Model<User>,
	) {}

	async createGroup(createGroupDto: CreateGroupDto, creatorId: string): Promise<GroupResponseDto> {
		const group = new this.groupModel({
			...createGroupDto,
			admins: [creatorId],
			members: [creatorId],
			memberCount: 1,
		});
		const savedGroup = await group.save();
		return this.mapToResponseDto(savedGroup);
	}

	async getAllGroups(
		page: number,
		limit: number,
		sport?: string,
		isPrivate?: boolean,
	): Promise<PaginatedGroupsResponseDto> {
		const skip = (page - 1) * limit;
		const filter: any = {};

		if (sport) {
			filter.sport = sport;
		}

		if (isPrivate !== undefined) {
			filter.isPrivate = isPrivate;
		}

		const [groups, total] = await Promise.all([
			this.groupModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
			this.groupModel.countDocuments(filter),
		]);

		const totalPages = Math.ceil(total / limit);

		return {
			total,
			page,
			limit,
			totalPages,
			data: groups.map(group => this.mapToResponseDto(group)),
		};
	}

	async getGroupById(groupId: string): Promise<GroupResponseDto> {
		const group = await this.groupModel.findById(groupId).lean();
		if (!group) {
			throw new Error('Group not found');
		}
		return this.mapToResponseDto(group);
	}

	async updateGroup(groupId: string, updateGroupDto: UpdateGroupDto): Promise<GroupResponseDto> {
		const group = await this.groupModel
			.findByIdAndUpdate(groupId, updateGroupDto, { new: true })
			.lean();

		if (!group) {
			throw new Error('Group not found');
		}

		return this.mapToResponseDto(group);
	}

	async deleteGroup(groupId: string): Promise<void> {
		const result = await this.groupModel.findByIdAndDelete(groupId);
		if (!result) {
			throw new Error('Group not found');
		}
	}

	async getGroupsByUserId(
		userId: string,
		page: number,
		limit: number,
	): Promise<PaginatedGroupsResponseDto> {
		const skip = (page - 1) * limit;
		const filter = {
			$or: [{ admins: new Types.ObjectId(userId) }, { members: new Types.ObjectId(userId) }],
		};

		const [groups, total] = await Promise.all([
			this.groupModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
			this.groupModel.countDocuments(filter),
		]);

		const totalPages = Math.ceil(total / limit);

		return {
			total,
			page,
			limit,
			totalPages,
			data: groups.map(group => this.mapToResponseDto(group)),
		};
	}

	async addMember(groupId: string, userId: string): Promise<void> {
		const result = await this.groupModel.findByIdAndUpdate(
			groupId,
			{
				$addToSet: { members: userId },
				$inc: { memberCount: 1 },
			},
			{ new: true },
		);

		if (!result) {
			throw new Error('Group not found');
		}
	}

	async removeMember(groupId: string, userId: string): Promise<void> {
		const result = await this.groupModel.findByIdAndUpdate(
			groupId,
			{
				$pull: { members: userId },
				$inc: { memberCount: -1 },
			},
			{ new: true },
		);

		if (!result) {
			throw new Error('Group not found');
		}
	}

	async addAdmin(groupId: string, userId: string): Promise<void> {
		const result = await this.groupModel.findByIdAndUpdate(
			groupId,
			{ $addToSet: { admins: userId } },
			{ new: true },
		);

		if (!result) {
			throw new Error('Group not found');
		}
	}

	async removeAdmin(groupId: string, userId: string): Promise<void> {
		const result = await this.groupModel.findByIdAndUpdate(
			groupId,
			{ $pull: { admins: userId } },
			{ new: true },
		);

		if (!result) {
			throw new Error('Group not found');
		}
	}

	async addToWaitingList(groupId: string, userId: string): Promise<void> {
		const result = await this.groupModel.findByIdAndUpdate(
			groupId,
			{ $addToSet: { waitingList: userId } },
			{ new: true },
		);

		if (!result) {
			throw new Error('Group not found');
		}
	}

	async removeFromWaitingList(groupId: string, userId: string): Promise<void> {
		const result = await this.groupModel.findByIdAndUpdate(
			groupId,
			{ $pull: { waitingList: userId } },
			{ new: true },
		);

		if (!result) {
			throw new Error('Group not found');
		}
	}

	async addToInviteList(groupId: string, userId: string): Promise<void> {
		const result = await this.groupModel.findByIdAndUpdate(
			groupId,
			{ $addToSet: { inviteList: userId } },
			{ new: true },
		);

		if (!result) {
			throw new Error('Group not found');
		}
	}

	async removeFromInviteList(groupId: string, userId: string): Promise<void> {
		const result = await this.groupModel.findByIdAndUpdate(
			groupId,
			{ $pull: { inviteList: userId } },
			{ new: true },
		);

		if (!result) {
			throw new Error('Group not found');
		}
	}

	async approveMember(groupId: string, userId: string): Promise<void> {
		const result = await this.groupModel.findByIdAndUpdate(
			groupId,
			{
				$pull: { waitingList: userId },
				$addToSet: { members: userId },
				$inc: { memberCount: 1 },
			},
			{ new: true },
		);

		if (!result) {
			throw new Error('Group not found');
		}
	}

	async isUserAdmin(groupId: string, userId: string): Promise<boolean> {
		const group = await this.groupModel.findById(new Types.ObjectId(groupId)).lean();
		return group?.admins?.some(adminId => adminId.toString() === userId) || false;
	}

	async isUserMember(groupId: string, userId: string): Promise<boolean> {
		const group = await this.groupModel.findById(groupId).lean();
		return group?.members?.some(memberId => memberId.toString() === userId) || false;
	}

	async isUserInWaitingList(groupId: string, userId: string): Promise<boolean> {
		const group = await this.groupModel.findById(groupId).lean();
		return group?.waitingList?.some(waitingId => waitingId.toString() === userId) || false;
	}

	async isUserInInviteList(groupId: string, userId: string): Promise<boolean> {
		const group = await this.groupModel.findById(groupId).lean();
		return group?.inviteList?.some(inviteId => inviteId.toString() === userId) || false;
	}

	async getGroupAdmins(groupId: string): Promise<string[]> {
		const group = await this.groupModel.findById(groupId).lean();
		if (!group) {
			throw new Error('Group not found');
		}
		return group.admins?.map(adminId => adminId.toString()) || [];
	}

	async getSimpleGroupsByUserId(
		userId: string,
		page: number,
		limit: number,
		key?: string,
		role?: string,
	): Promise<PaginatedSimpleGroupsResponseDto> {
		const skip = (page - 1) * limit;
		let filter: any = {};
		if (role === 'admin') {
			filter = { admins: new Types.ObjectId(userId) };
		} else if (role === 'member') {
			filter = { members: new Types.ObjectId(userId), admins: { $ne: new Types.ObjectId(userId) } };
		} else {
			filter = {
				$or: [{ admins: new Types.ObjectId(userId) }, { members: new Types.ObjectId(userId) }],
			};
		}
		if (key) {
			filter.name = { $regex: key, $options: 'i' };
		}

		const groups = await this.groupModel
			.find(filter)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean();

		const total = await this.groupModel.countDocuments(filter);
		const totalPages = Math.ceil(total / limit);

		// Get latest post time and role for each group
		const groupsWithLatestPostAndRole = await Promise.all(
			groups.map(async group => {
				const latestPost = await this.postModel
					.findOne({ groupId: group._id })
					.sort({ createdAt: -1 })
					.select('createdAt')
					.lean();

				let groupRole: 'admin' | 'member' = 'member';
				if (group.admins && group.admins.some((id: any) => id.toString() === userId)) {
					groupRole = 'admin';
				}

				return {
					...this.mapToSimpleResponseDto(group, groupRole),
					latestPostTime: latestPost && 'createdAt' in latestPost ? latestPost.createdAt : null,
				};
			}),
		);

		return {
			total,
			page,
			limit,
			totalPages,
			data: groupsWithLatestPostAndRole,
		};
	}

	async getGroupMembers(
		groupId: string,
		page: number,
		limit: number,
		role?: 'admin' | 'member',
	): Promise<{
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		data: any[];
	}> {
		const group = await this.groupModel.findById(groupId).lean();
		if (!group) {
			throw new Error('Group not found');
		}
		let userIds: string[] = [];
		if (role === 'admin') {
			userIds = (group.admins || []).map((id: any) => id.toString());
		} else {
			const adminIds = (group.admins || []).map((id: any) => id.toString());
			userIds = (group.members || [])
				.map((id: any) => id.toString())
				.filter(id => !adminIds.includes(id));
		}
		const total = userIds.length;
		const totalPages = Math.ceil(total / limit);
		const skip = (page - 1) * limit;
		const pagedUserIds = userIds.slice(skip, skip + limit);
		if (pagedUserIds.length === 0) {
			return { total, page, limit, totalPages, data: [] };
		}
		const users = await this.userModel
			.find({ _id: { $in: pagedUserIds.map(id => new Types.ObjectId(id)) } })
			.select('_id email firstName lastName avatar fullName')
			.lean({ virtuals: true });
		return {
			total,
			page,
			limit,
			totalPages,
			data: users,
		};
	}

	async findManyByIds(ids: string[]): Promise<any[]> {
		return this.groupModel.find({ _id: { $in: ids } }).lean();
	}

	async getWaitingListUsers(groupId: string, page: number, limit: number) {
		const group = await this.groupModel.findById(groupId).lean();
		if (!group) throw new Error('Group not found');
		const userIds = (group.waitingList || []).map((id: any) => id.toString());
		const total = userIds.length;
		const totalPages = Math.ceil(total / limit);
		const skip = (page - 1) * limit;
		const pagedUserIds = userIds.slice(skip, skip + limit);
		if (pagedUserIds.length === 0) {
			return { total, page, limit, totalPages, data: [] };
		}
		const users = await this.userModel
			.find({ _id: { $in: pagedUserIds.map(id => new Types.ObjectId(id)) } })
			.select('_id email firstName lastName avatar fullName')
			.lean({ virtuals: true });
		return { total, page, limit, totalPages, data: users };
	}

	async getInviteListUsers(groupId: string, page: number, limit: number) {
		const group = await this.groupModel.findById(groupId).lean();
		if (!group) throw new Error('Group not found');
		const userIds = (group.inviteList || []).map((id: any) => id.toString());
		const total = userIds.length;
		const totalPages = Math.ceil(total / limit);
		const skip = (page - 1) * limit;
		const pagedUserIds = userIds.slice(skip, skip + limit);
		if (pagedUserIds.length === 0) {
			return { total, page, limit, totalPages, data: [] };
		}
		const users = await this.userModel
			.find({ _id: { $in: pagedUserIds.map(id => new Types.ObjectId(id)) } })
			.select('_id email firstName lastName avatar fullName')
			.lean({ virtuals: true });
		return { total, page, limit, totalPages, data: users };
	}

	async getGroupsUserIsWaiting(userId: string, page: number, limit: number) {
		const skip = (page - 1) * limit;
		const filter = { waitingList: new Types.ObjectId(userId) };
		const [groups, total] = await Promise.all([
			this.groupModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
			this.groupModel.countDocuments(filter),
		]);
		const totalPages = Math.ceil(total / limit);
		return {
			total,
			page,
			limit,
			totalPages,
			data: groups.map(group => this.mapToResponseDto(group)),
		};
	}

	private mapToResponseDto(group: any): GroupResponseDto {
		return {
			_id: group._id.toString(),
			name: group.name,
			description: group.description,
			avatar: group.avatar,
			coverImage: group.coverImage,
			admins: group.admins?.map((id: any) => id.toString()) || [],
			members: group.members?.map((id: any) => id.toString()) || [],
			waitingList: group.waitingList?.map((id: any) => id.toString()) || [],
			inviteList: group.inviteList?.map((id: any) => id.toString()) || [],
			sport: group.sport,
			location: group.location,
			isPrivate: group.isPrivate,
			memberCount: group.memberCount,
			requirePostApproval: group.requirePostApproval,
			autoApproveJoinGroup: group.autoApproveJoinGroup,
			joinConditions: group.joinConditions,
			createdAt: group.createdAt,
			updatedAt: group.updatedAt,
		};
	}

	private mapToSimpleResponseDto(group: any, role: 'admin' | 'member'): SimpleGroupResponseDto {
		return {
			_id: group._id.toString(),
			name: group.name,
			description: group.description,
			avatar: group.avatar,
			role,
		};
	}
}
