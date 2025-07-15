import { Types } from 'mongoose';
import {
	CreateGroupDto,
	UpdateGroupDto,
	PaginatedGroupsResponseDto,
	GroupResponseDto,
	PaginatedSimpleGroupsResponseDto,
	SimpleGroupResponseDto,
} from '../dto/group.dto';
import { SportType } from '@modules/user/enums/user.enum';

export interface IGroupRepository {
	createGroup(createGroupDto: CreateGroupDto, creatorId: string): Promise<GroupResponseDto>;
	getAllGroups(
		page: number,
		limit: number,
		sport?: string,
		isPrivate?: boolean,
	): Promise<PaginatedGroupsResponseDto>;
	getGroupById(groupId: string): Promise<GroupResponseDto>;
	updateGroup(groupId: string, updateGroupDto: UpdateGroupDto): Promise<GroupResponseDto>;
	deleteGroup(groupId: string): Promise<void>;
	getGroupsByUserId(
		userId: string,
		page: number,
		limit: number,
	): Promise<PaginatedGroupsResponseDto>;
	getSimpleGroupsByUserId(
		userId: string,
		page: number,
		limit: number,
	): Promise<PaginatedSimpleGroupsResponseDto>;
	addMember(groupId: string, userId: string): Promise<void>;
	removeMember(groupId: string, userId: string): Promise<void>;
	addAdmin(groupId: string, userId: string): Promise<void>;
	removeAdmin(groupId: string, userId: string): Promise<void>;
	addToWaitingList(groupId: string, userId: string): Promise<void>;
	removeFromWaitingList(groupId: string, userId: string): Promise<void>;
	approveMember(groupId: string, userId: string): Promise<void>;
	isUserAdmin(groupId: string, userId: string): Promise<boolean>;
	isUserMember(groupId: string, userId: string): Promise<boolean>;
	isUserInWaitingList(groupId: string, userId: string): Promise<boolean>;
}

export const IGroupRepository = Symbol('IGroupRepository');
