import {
	Injectable,
	BadRequestException,
	ForbiddenException,
	NotFoundException,
} from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { IGroupRepository } from '../repositories/group.repository';
import {
	CreateGroupDto,
	UpdateGroupDto,
	PaginatedGroupsResponseDto,
	GroupResponseDto,
	PaginatedSimpleGroupsResponseDto,
} from '../dto/group.dto';
import { SportType, ActivityLevel } from '@modules/user/enums/user.enum';
import { NotificationService } from '../../notification/providers/notification.service';
import { NotificationType, ReferenceModel } from '../../notification/entities/notification.enum';
import { CreatePostDto } from '@modules/post/dto/post.dto';
import { PostService } from '@modules/post/providers/post.service';
import { PostStatus } from '@modules/post/entities/post.enum';
import { UserService } from '@modules/user/providers/user.service';
import { Types } from 'mongoose';
@Injectable()
export class GroupService {
	constructor(
		private readonly groupRepository: IGroupRepository,
		private readonly notificationService: NotificationService,
		private readonly userService: UserService,
	) {}

	async createGroup(
		createGroupDto: CreateGroupDto,
		creatorId: string,
		i18n: I18nContext,
	): Promise<GroupResponseDto> {
		try {
			// Validate sport type
			if (!Object.values(SportType).includes(createGroupDto.sport)) {
				throw new BadRequestException(i18n.t('group.INVALID_SPORT_TYPE'));
			}

			// Validate group name
			if (!createGroupDto.name || createGroupDto.name.trim().length === 0) {
				throw new BadRequestException(i18n.t('group.NAME_REQUIRED'));
			}

			if (createGroupDto.name.length > 100) {
				throw new BadRequestException(i18n.t('group.NAME_TOO_LONG'));
			}

			// Validate description length
			if (createGroupDto.description && createGroupDto.description.length > 500) {
				throw new BadRequestException(i18n.t('group.DESCRIPTION_TOO_LONG'));
			}

			return await this.groupRepository.createGroup(createGroupDto, creatorId);
		} catch (error) {
			if (error instanceof BadRequestException) {
				throw error;
			}
			throw new BadRequestException(i18n.t('group.GROUP_CREATION_FAILED'));
		}
	}

	async getAllGroups(
		i18n: I18nContext,
		page: number = 1,
		limit: number = 10,
		sport?: string,
		isPrivate?: boolean,
	): Promise<PaginatedGroupsResponseDto> {
		try {
			// Validate pagination parameters
			if (page < 1) page = 1;
			if (limit < 1 || limit > 50) limit = 10;

			// Validate sport type if provided
			if (sport && !Object.values(SportType).includes(sport as SportType)) {
				throw new BadRequestException(i18n.t('group.INVALID_SPORT_TYPE'));
			}

			return await this.groupRepository.getAllGroups(page, limit, sport, isPrivate);
		} catch (error) {
			if (error instanceof BadRequestException) {
				throw error;
			}
			throw new BadRequestException(i18n.t('group.GROUPS_RETRIEVAL_FAILED'));
		}
	}

	async getGroupById(groupId: string, i18n: I18nContext): Promise<GroupResponseDto> {
		try {
			if (!groupId || groupId.trim().length === 0) {
				throw new BadRequestException(i18n.t('group.INVALID_GROUP_ID'));
			}

			return await this.groupRepository.getGroupById(groupId);
		} catch (error) {
			if (error instanceof BadRequestException) {
				throw error;
			}
			if (error.message === 'Group not found') {
				throw new NotFoundException(i18n.t('group.GROUP_NOT_FOUND'));
			}
			throw new BadRequestException(i18n.t('group.GROUP_RETRIEVAL_FAILED'));
		}
	}

	async updateGroup(
		groupId: string,
		updateGroupDto: UpdateGroupDto,
		userId: string,
		i18n: I18nContext,
	): Promise<GroupResponseDto> {
		try {
			if (!groupId || groupId.trim().length === 0) {
				throw new BadRequestException(i18n.t('group.INVALID_GROUP_ID'));
			}

			// Check if user is admin of the group
			const isAdmin = await this.groupRepository.isUserAdmin(groupId, userId);
			if (!isAdmin) {
				throw new ForbiddenException(i18n.t('group.UNAUTHORIZED_TO_MODIFY'));
			}

			// Validate sport type if provided
			if (updateGroupDto.sport && !Object.values(SportType).includes(updateGroupDto.sport)) {
				throw new BadRequestException(i18n.t('group.INVALID_SPORT_TYPE'));
			}

			// Validate group name if provided
			if (updateGroupDto.name !== undefined) {
				if (!updateGroupDto.name || updateGroupDto.name.trim().length === 0) {
					throw new BadRequestException(i18n.t('group.NAME_REQUIRED'));
				}

				if (updateGroupDto.name.length > 100) {
					throw new BadRequestException(i18n.t('group.NAME_TOO_LONG'));
				}
			}

			// Validate description length if provided
			if (updateGroupDto.description !== undefined) {
				if (updateGroupDto.description && updateGroupDto.description.length > 500) {
					throw new BadRequestException(i18n.t('group.DESCRIPTION_TOO_LONG'));
				}
			}

			return await this.groupRepository.updateGroup(groupId, updateGroupDto);
		} catch (error) {
			if (error instanceof BadRequestException || error instanceof ForbiddenException) {
				throw error;
			}
			if (error.message === 'Group not found') {
				throw new NotFoundException(i18n.t('group.GROUP_NOT_FOUND'));
			}
			throw new BadRequestException(i18n.t('group.GROUP_UPDATE_FAILED'));
		}
	}

	async deleteGroup(groupId: string, userId: string, i18n: I18nContext): Promise<void> {
		try {
			if (!groupId || groupId.trim().length === 0) {
				throw new BadRequestException(i18n.t('group.INVALID_GROUP_ID'));
			}

			// Check if user is admin of the group
			const isAdmin = await this.groupRepository.isUserAdmin(groupId, userId);
			if (!isAdmin) {
				throw new ForbiddenException(i18n.t('group.UNAUTHORIZED_TO_DELETE'));
			}

			await this.groupRepository.deleteGroup(groupId);
		} catch (error) {
			if (error instanceof BadRequestException || error instanceof ForbiddenException) {
				throw error;
			}
			if (error.message === 'Group not found') {
				throw new NotFoundException(i18n.t('group.GROUP_NOT_FOUND'));
			}
			throw new BadRequestException(i18n.t('group.GROUP_DELETE_FAILED'));
		}
	}

	async getGroupsByUserId(
		userId: string,
		i18n: I18nContext,
		page: number = 1,
		limit: number = 10,
	): Promise<PaginatedGroupsResponseDto> {
		try {
			if (!userId || userId.trim().length === 0) {
				throw new BadRequestException(i18n.t('group.INVALID_USER_ID'));
			}

			// Validate pagination parameters
			if (page < 1) page = 1;
			if (limit < 1 || limit > 50) limit = 10;

			return await this.groupRepository.getGroupsByUserId(userId, page, limit);
		} catch (error) {
			if (error instanceof BadRequestException) {
				throw error;
			}
			throw new BadRequestException(i18n.t('group.USER_GROUPS_RETRIEVAL_FAILED'));
		}
	}

	async getSimpleGroupsByUserId(
		userId: string,
		i18n: I18nContext,
		page: number = 1,
		limit: number = 10,
		key?: string,
		role?: string,
	): Promise<PaginatedSimpleGroupsResponseDto> {
		try {
			if (!userId || userId.trim().length === 0) {
				throw new BadRequestException(i18n.t('group.INVALID_USER_ID'));
			}

			// Validate pagination parameters
			if (page < 1) page = 1;
			if (limit < 1 || limit > 50) limit = 10;

			return await this.groupRepository.getSimpleGroupsByUserId(userId, page, limit, key, role);
		} catch (error) {
			if (error instanceof BadRequestException) {
				throw error;
			}
			throw new BadRequestException(i18n.t('group.USER_GROUPS_RETRIEVAL_FAILED'));
		}
	}

	async joinGroup(groupId: string, userId: string, i18n: I18nContext): Promise<void> {
		try {
			if (!groupId || groupId.trim().length === 0) {
				throw new BadRequestException(i18n.t('group.INVALID_GROUP_ID'));
			}

			// Lấy thông tin group để kiểm tra autoApproveJoinGroup và joinConditions
			const group = await this.groupRepository.getGroupById(groupId);

			// Kiểm tra điều kiện tham gia (joinConditions)
			if (group.joinConditions && Object.keys(group.joinConditions).length > 0) {
				// Lấy thông tin skill levels của user
				const userSkillLevels = await this.userService.getSkillLevelsByUserId(userId, i18n);

				// Kiểm tra tất cả điều kiện trong joinConditions
				for (const [sport, requiredLevel] of Object.entries(group.joinConditions)) {
					if (!userSkillLevels) {
						throw new BadRequestException(i18n.t('group.NO_SKILL_LEVELS_DEFINED'));
					}

					const userLevel = userSkillLevels.get(sport as SportType);
					if (!userLevel) {
						throw new BadRequestException(
							i18n.t('group.NO_SKILL_LEVEL_FOR_SPORT', { args: { sport: sport } }),
						);
					}

					// So sánh mức độ kỹ năng (giả sử enum có thứ tự tăng dần)
					const levelOrder = {
						[ActivityLevel.BEGINNER]: 1,
						[ActivityLevel.INTERMEDIATE]: 2,
						[ActivityLevel.ADVANCED]: 3,
						[ActivityLevel.PROFESSIONAL]: 4,
					};

					const userLevelOrder = levelOrder[userLevel];
					const requiredLevelOrder = levelOrder[requiredLevel];

					if (userLevelOrder < requiredLevelOrder) {
						throw new BadRequestException(
							i18n.t('group.INSUFFICIENT_SKILL_LEVEL', {
								args: {
									sport,
									required: requiredLevel,
									current: userLevel,
								},
							}),
						);
					}
				}
			}

			if (group.autoApproveJoinGroup) {
				await this.groupRepository.addMember(groupId, userId);
				return;
			}

			// Check if user is already a member
			const isMember = await this.groupRepository.isUserMember(groupId, userId);
			if (isMember) {
				throw new BadRequestException(i18n.t('group.ALREADY_MEMBER'));
			}

			// Check if user is in waiting list
			const isInWaitingList = await this.groupRepository.isUserInWaitingList(groupId, userId);
			if (isInWaitingList) {
				throw new BadRequestException(i18n.t('group.ALREADY_IN_WAITING_LIST'));
			}

			await this.groupRepository.addToWaitingList(groupId, userId);

			// Send notifications to group admins
			try {
				const adminIds = await this.groupRepository.getGroupAdmins(groupId);
				// Send notification to each admin (except the user requesting to join)
				const notifications = adminIds
					.filter(adminId => adminId !== userId)
					.map(adminId => ({
						recipient: adminId,
						sender: userId,
						type: NotificationType.GROUP_JOIN_REQUEST,
						message: `@${userId} MESSAGE_JOIN_REQUEST`,
						referenceId: groupId,
						referenceModel: ReferenceModel.GROUP,
						relatedUsers: [userId],
					}));
				// Create notifications in parallel
				await Promise.all(
					notifications.map(notification =>
						this.notificationService.createNotification(notification),
					),
				);
			} catch (notificationError) {
				// Log the error but don't fail the join request
				console.error('Failed to send join request notifications:', notificationError);
			}
		} catch (error) {
			if (error instanceof BadRequestException) {
				throw error;
			}
			if (error.message === 'Group not found') {
				throw new NotFoundException(i18n.t('group.GROUP_NOT_FOUND'));
			}
			if (error.message === 'User not found') {
				throw new NotFoundException(i18n.t('group.USER_NOT_FOUND'));
			}
			throw new BadRequestException(i18n.t('group.JOIN_GROUP_FAILED'));
		}
	}

	async leaveGroup(groupId: string, userId: string, i18n: I18nContext): Promise<void> {
		try {
			if (!groupId || groupId.trim().length === 0) {
				throw new BadRequestException(i18n.t('group.INVALID_GROUP_ID'));
			}

			// Check if user is a member
			const isMember = await this.groupRepository.isUserMember(groupId, userId);
			if (!isMember) {
				throw new BadRequestException(i18n.t('group.NOT_MEMBER'));
			}

			// Check if user is admin and if they're the last admin
			const isAdmin = await this.groupRepository.isUserAdmin(groupId, userId);
			if (isAdmin) {
				// TODO: Add logic to check if this is the last admin
				// For now, allow admin to leave
			}

			await this.groupRepository.removeMember(groupId, userId);
		} catch (error) {
			if (error instanceof BadRequestException) {
				throw error;
			}
			if (error.message === 'Group not found') {
				throw new NotFoundException(i18n.t('group.GROUP_NOT_FOUND'));
			}
			throw new BadRequestException(i18n.t('group.LEAVE_GROUP_FAILED'));
		}
	}

	async changeMemberRole(
		groupId: string,
		targetUserId: string,
		role: string,
		adminUserId: string,
		i18n: I18nContext,
	): Promise<void> {
		try {
			if (!groupId || groupId.trim().length === 0) {
				throw new BadRequestException(i18n.t('group.INVALID_GROUP_ID'));
			}

			// Check if admin user is actually an admin
			const isAdmin = await this.groupRepository.isUserAdmin(groupId, adminUserId);
			if (!isAdmin) {
				throw new ForbiddenException(i18n.t('group.UNAUTHORIZED_TO_MODIFY_ROLE'));
			}

			// Validate role
			if (!['admin', 'member'].includes(role)) {
				throw new BadRequestException(i18n.t('group.INVALID_ROLE'));
			}

			if (role === 'admin') {
				await this.groupRepository.addAdmin(groupId, targetUserId);
			} else {
				await this.groupRepository.removeAdmin(groupId, targetUserId);
			}
		} catch (error) {
			if (error instanceof BadRequestException || error instanceof ForbiddenException) {
				throw error;
			}
			if (error.message === 'Group not found') {
				throw new NotFoundException(i18n.t('group.GROUP_NOT_FOUND'));
			}
			throw new BadRequestException(i18n.t('group.ROLE_CHANGE_FAILED'));
		}
	}

	async getGroupMembers(
		groupId: string,
		i18n: I18nContext,
		page: number = 1,
		limit: number = 10,
		role?: string,
	): Promise<any> {
		try {
			if (!groupId || groupId.trim().length === 0) {
				throw new BadRequestException(i18n.t('group.INVALID_GROUP_ID'));
			}

			// Validate pagination parameters
			if (page < 1) page = 1;
			if (limit < 1 || limit > 50) limit = 10;

			// Validate role filter
			if (role && !['admin', 'member', 'waiting'].includes(role)) {
				throw new BadRequestException(i18n.t('group.INVALID_ROLE_FILTER'));
			}

			// TODO: Implement getGroupMembers in repository
			// For now, return a placeholder response
			return {
				total: 0,
				page,
				limit,
				totalPages: 0,
				data: [],
			};
		} catch (error) {
			if (error instanceof BadRequestException) {
				throw error;
			}
			if (error.message === 'Group not found') {
				throw new NotFoundException(i18n.t('group.GROUP_NOT_FOUND'));
			}
			throw new BadRequestException(i18n.t('group.MEMBERS_RETRIEVAL_FAILED'));
		}
	}

	async approveJoinRequest(
		groupId: string,
		requestId: string,
		approved: boolean,
		adminUserId: string,
		i18n: I18nContext,
	): Promise<void> {
		try {
			if (!groupId || groupId.trim().length === 0) {
				throw new BadRequestException(i18n.t('group.INVALID_GROUP_ID'));
			}

			// Check if admin user is actually an admin
			const isAdmin = await this.groupRepository.isUserAdmin(groupId, adminUserId);
			if (!isAdmin) {
				throw new ForbiddenException(i18n.t('group.UNAUTHORIZED_TO_APPROVE'));
			}

			// Check if user is in waiting list
			const isInWaitingList = await this.groupRepository.isUserInWaitingList(groupId, requestId);
			if (!isInWaitingList) {
				throw new BadRequestException(i18n.t('group.NOT_IN_WAITING_LIST'));
			}

			if (approved) {
				await this.groupRepository.approveMember(groupId, requestId);
			} else {
				await this.groupRepository.removeFromWaitingList(groupId, requestId);
			}
		} catch (error) {
			if (error instanceof BadRequestException || error instanceof ForbiddenException) {
				throw error;
			}
			if (error.message === 'Group not found') {
				throw new NotFoundException(i18n.t('group.GROUP_NOT_FOUND'));
			}
			throw new BadRequestException(i18n.t('group.REQUEST_APPROVAL_FAILED'));
		}
	}

	async inviteUsersToGroup(
		groupId: string,
		userIds: string[],
		senderId: string,
		i18n: I18nContext,
	): Promise<void> {
		try {
			if (!groupId || groupId.trim().length === 0) {
				throw new BadRequestException(i18n.t('group.INVALID_GROUP_ID'));
			}

			if (!userIds || userIds.length === 0) {
				throw new BadRequestException(i18n.t('group.USER_IDS_REQUIRED'));
			}

			// Check if sender is a member of the group
			const isMember = await this.groupRepository.isUserMember(groupId, senderId);
			if (!isMember) {
				throw new ForbiddenException(i18n.t('group.UNAUTHORIZED_TO_INVITE'));
			}

			// Filter out users who are already members, in waiting list, or in invite list
			const validUserIds: string[] = [];
			for (const userId of userIds) {
				const isAlreadyMember = await this.groupRepository.isUserMember(groupId, userId);
				const isInWaitingList = await this.groupRepository.isUserInWaitingList(groupId, userId);
				const isInInviteList = await this.groupRepository.isUserInInviteList(groupId, userId);

				if (!isAlreadyMember && !isInWaitingList && !isInInviteList) {
					validUserIds.push(userId);
				}
			}

			if (validUserIds.length === 0) {
				throw new BadRequestException(i18n.t('group.NO_VALID_USERS_TO_INVITE'));
			}

			// Add users to invite list
			await Promise.all(
				validUserIds.map(userId => this.groupRepository.addToInviteList(groupId, userId)),
			);

			// Send notifications to invited users
			await Promise.all(
				validUserIds
					.filter(invitedUserId => invitedUserId !== senderId) // Không gửi notification cho chính mình
					.map(invitedUserId =>
						this.notificationService.createNotification({
							recipient: invitedUserId,
							sender: senderId,
							type: NotificationType.GROUP_INVITATION,
							message: `@${senderId} MESSAGE_INVITED_TO_GROUP @${groupId}`,
							referenceId: groupId,
							referenceModel: ReferenceModel.GROUP,
						}),
					),
			);
		} catch (error) {
			if (error instanceof BadRequestException || error instanceof ForbiddenException) {
				throw error;
			}
			if (error.message === 'Group not found') {
				throw new NotFoundException(i18n.t('group.GROUP_NOT_FOUND'));
			}
			throw new BadRequestException(i18n.t('group.INVITE_USERS_FAILED'));
		}
	}

	async acceptGroupInvitation(groupId: string, userId: string, i18n: I18nContext): Promise<void> {
		try {
			if (!groupId || groupId.trim().length === 0) {
				throw new BadRequestException(i18n.t('group.INVALID_GROUP_ID'));
			}

			// Check if user is in invite list
			const isInInviteList = await this.groupRepository.isUserInInviteList(groupId, userId);
			if (!isInInviteList) {
				throw new BadRequestException(i18n.t('group.NOT_IN_INVITE_LIST'));
			}

			// Check if user is already a member
			const isMember = await this.groupRepository.isUserMember(groupId, userId);
			if (isMember) {
				throw new BadRequestException(i18n.t('group.ALREADY_MEMBER'));
			}

			// Move user from invite list to members
			await this.groupRepository.removeFromInviteList(groupId, userId);
			await this.groupRepository.addMember(groupId, userId);

			// Send notifications to group admins
			try {
				const adminIds = await this.groupRepository.getGroupAdmins(groupId);
				const group = await this.groupRepository.getGroupById(groupId);

				// Send notification to each admin (except the user who accepted the invitation)
				const notifications = adminIds
					.filter(adminId => adminId !== userId)
					.map(adminId => ({
						recipient: adminId,
						sender: userId,
						type: NotificationType.GROUP_INVITATION_ACCEPTED,
						message: `@${userId} MESSAGE_ACCEPTED_INVITATION`,
						referenceId: groupId,
						referenceModel: ReferenceModel.GROUP,
						relatedUsers: [userId],
					}));

				// Create notifications in parallel
				await Promise.all(
					notifications.map(notification =>
						this.notificationService.createNotification(notification),
					),
				);
			} catch (notificationError) {
				// Log the error but don't fail the invitation acceptance
				console.error('Failed to send invitation acceptance notifications:', notificationError);
			}
		} catch (error) {
			if (error instanceof BadRequestException) {
				throw error;
			}
			if (error.message === 'Group not found') {
				throw new NotFoundException(i18n.t('group.GROUP_NOT_FOUND'));
			}
			throw new BadRequestException(i18n.t('group.ACCEPT_INVITATION_FAILED'));
		}
	}

	async rejectGroupInvitation(groupId: string, userId: string, i18n: I18nContext): Promise<void> {
		try {
			if (!groupId || groupId.trim().length === 0) {
				throw new BadRequestException(i18n.t('group.INVALID_GROUP_ID'));
			}

			// Check if user is in invite list
			const isInInviteList = await this.groupRepository.isUserInInviteList(groupId, userId);
			if (!isInInviteList) {
				throw new BadRequestException(i18n.t('group.NOT_IN_INVITE_LIST'));
			}

			// Remove user from invite list
			await this.groupRepository.removeFromInviteList(groupId, userId);

			// Send notifications to group admins
			try {
				const adminIds = await this.groupRepository.getGroupAdmins(groupId);
				const group = await this.groupRepository.getGroupById(groupId);

				// Send notification to each admin (except the user who rejected the invitation)
				const notifications = adminIds
					.filter(adminId => adminId !== userId)
					.map(adminId => ({
						recipient: adminId,
						sender: userId,
						type: NotificationType.GROUP_INVITATION_REJECTED,
						message: `@${userId} MESSAGE_REJECTED_INVITATION`,
						referenceId: groupId,
						referenceModel: ReferenceModel.GROUP,
						relatedUsers: [userId],
					}));

				// Create notifications in parallel
				await Promise.all(
					notifications.map(notification =>
						this.notificationService.createNotification(notification),
					),
				);
			} catch (notificationError) {
				// Log the error but don't fail the invitation rejection
				console.error('Failed to send invitation rejection notifications:', notificationError);
			}
		} catch (error) {
			if (error instanceof BadRequestException) {
				throw error;
			}
			if (error.message === 'Group not found') {
				throw new NotFoundException(i18n.t('group.GROUP_NOT_FOUND'));
			}
			throw new BadRequestException(i18n.t('group.REJECT_INVITATION_FAILED'));
		}
	}

	async createGroupPost(
		userId: string,
		createPostDto: CreatePostDto,
		files: Express.Multer.File[],
		i18n: I18nContext,
		postService: PostService,
	): Promise<any> {
		const groupId = createPostDto.groupId?.toString();
		if (!groupId) {
			throw new BadRequestException(i18n.t('group.GROUP_ID_REQUIRED'));
		}

		// Lấy thông tin group
		const group = await this.groupRepository.getGroupById(groupId);
		const isAdmin = group.admins.includes(userId);

		// Xác định trạng thái duyệt bài
		let approvalStatus: PostStatus | undefined = undefined;
		let needApproval = false;
		if (isAdmin) {
			approvalStatus = PostStatus.APPROVED;
		} else if (!group.requirePostApproval) {
			approvalStatus = PostStatus.APPROVED;
		} else {
			approvalStatus = PostStatus.PENDING;
			needApproval = true;
		}

		// Inject trạng thái duyệt vào DTO
		const postDtoWithStatus = { ...createPostDto, approvalStatus };
		const post = await postService.createPost(postDtoWithStatus, userId, files, i18n);

		// Chỉ gửi notification nếu cần phê duyệt
		if (needApproval) {
			const adminIds = group.admins.filter(adminId => adminId !== userId);
			if (adminIds.length > 0) {
				const notifications = adminIds.map(adminId => ({
					recipient: adminId,
					sender: userId,
					type: NotificationType.REQUEST_APPROVE_POST,
					message: `@${userId} MESSAGE_NEW_POST_IN_GROUP`,
					referenceId: post._id,
					referenceModel: ReferenceModel.POST,
					relatedUsers: [userId],
				}));
				await Promise.all(
					notifications.map(notification =>
						this.notificationService.createNotification(notification),
					),
				);
			}
		}

		return post;
	}

	async removeMemberFromGroup(
		groupId: string,
		userId: string,
		adminUserId: string,
		i18n: I18nContext,
	): Promise<void> {
		try {
			if (!groupId || groupId.trim().length === 0) {
				throw new BadRequestException(i18n.t('group.INVALID_GROUP_ID'));
			}
			if (!userId || userId.trim().length === 0) {
				throw new BadRequestException(i18n.t('group.INVALID_USER_ID'));
			}
			const isAdmin = await this.groupRepository.isUserAdmin(groupId, adminUserId);
			if (!isAdmin) {
				throw new ForbiddenException(i18n.t('group.UNAUTHORIZED_TO_MODIFY'));
			}
			const isMember = await this.groupRepository.isUserMember(groupId, userId);
			if (!isMember) {
				throw new BadRequestException(i18n.t('group.NOT_MEMBER'));
			}
			await this.groupRepository.removeMember(groupId, userId);
		} catch (error) {
			if (error instanceof BadRequestException || error instanceof ForbiddenException) {
				throw error;
			}
			if (error.message === 'Group not found') {
				throw new NotFoundException(i18n.t('group.GROUP_NOT_FOUND'));
			}
			throw new BadRequestException(i18n.t('group.GROUP_UPDATE_FAILED'));
		}
	}

	async cancelGroupInvitation(
		groupId: string,
		userId: string,
		adminUserId: string,
		i18n: I18nContext,
	): Promise<void> {
		try {
			if (!groupId || groupId.trim().length === 0) {
				throw new BadRequestException(i18n.t('group.INVALID_GROUP_ID'));
			}
			if (!userId || userId.trim().length === 0) {
				throw new BadRequestException(i18n.t('group.INVALID_USER_ID'));
			}
			const isAdmin = await this.groupRepository.isUserAdmin(groupId, adminUserId);
			if (!isAdmin) {
				throw new ForbiddenException(i18n.t('group.UNAUTHORIZED_TO_MODIFY'));
			}
			const isInInviteList = await this.groupRepository.isUserInInviteList(groupId, userId);
			if (!isInInviteList) {
				throw new BadRequestException(i18n.t('group.NOT_IN_INVITE_LIST'));
			}
			await this.groupRepository.removeFromInviteList(groupId, userId);

			// Xóa notification lời mời nếu có
			await this.notificationService.deleteByCondition({
				recipient: new Types.ObjectId(userId),
				type: NotificationType.GROUP_INVITATION,
				referenceId: new Types.ObjectId(groupId),
				referenceModel: ReferenceModel.GROUP,
			});
		} catch (error) {
			if (error instanceof BadRequestException || error instanceof ForbiddenException) {
				throw error;
			}
			if (error.message === 'Group not found') {
				throw new NotFoundException(i18n.t('group.GROUP_NOT_FOUND'));
			}
			throw new BadRequestException(i18n.t('group.GROUP_UPDATE_FAILED'));
		}
	}
}
