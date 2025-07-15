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
import { SportType } from '@modules/user/enums/user.enum';

@Injectable()
export class GroupService {
	constructor(private readonly groupRepository: IGroupRepository) {}

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
	): Promise<PaginatedSimpleGroupsResponseDto> {
		try {
			if (!userId || userId.trim().length === 0) {
				throw new BadRequestException(i18n.t('group.INVALID_USER_ID'));
			}

			// Validate pagination parameters
			if (page < 1) page = 1;
			if (limit < 1 || limit > 50) limit = 10;

			return await this.groupRepository.getSimpleGroupsByUserId(userId, page, limit);
		} catch (error) {
			if (error instanceof BadRequestException) {
				throw error;
			}
			throw new BadRequestException(i18n.t('group.USER_GROUPS_RETRIEVAL_FAILED'));
		}
	}
}
