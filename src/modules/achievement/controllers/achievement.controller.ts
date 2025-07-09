import { Controller, Get, Post, Body, Request, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { RolesGuard } from '@common/guards';
import { Roles } from '@common/decorators';
import { Role } from '@common/enum';
import { IAchievementRepository } from '../repositories/achievement.repository';
import { AchievementProgressDto } from '../dto/achievement-progress.dto';
import { IUserAchievementRepository } from '../repositories/user-achievement.repository';

@ApiTags('Achievement')
@Controller('achievements')
export class AchievementController {
	constructor(
		private readonly achievementRepo: IAchievementRepository,
		private readonly userAchievementRepo: IUserAchievementRepository,
	) {}

	@Get('all')
	@ApiOperation({ summary: 'Lấy tất cả achievement' })
	@ApiResponse({ status: 200, description: 'Lấy thành công' })
	async getAllAchievements(@I18n() i18n: I18nContext) {
		const achievements = await this.achievementRepo.findAllAchievements();
		return {
			success: true,
			data: achievements,
			message: i18n.t('achievement.LIST_SUCCESS'),
		};
	}

	@Get('user')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Lấy achievement của user hiện tại' })
	@ApiResponse({ status: 200, description: 'Lấy thành công' })
	async getUserAchievements(@Request() req, @I18n() i18n: I18nContext) {
		const userId = req.user.id;
		const achievements = await this.userAchievementRepo.findUserAchievements(userId);
		return {
			success: true,
			data: achievements,
			message: i18n.t('achievement.USER_LIST_SUCCESS'),
		};
	}

	@Post('unlock')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Unlock achievement cho user' })
	@ApiBody({ type: AchievementProgressDto })
	@ApiResponse({ status: 200, description: 'Unlock thành công' })
	async unlockAchievement(
		@Request() req,
		@Body() dto: AchievementProgressDto,
		@I18n() i18n: I18nContext,
	) {
		const userId = req.user.id;
		const result = await this.userAchievementRepo.unlockAchievement(userId, dto.achievementId);
		return {
			success: true,
			data: result,
			message: i18n.t('achievement.UNLOCK_SUCCESS'),
		};
	}

	@Post('progress')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Cập nhật tiến trình achievement cho user' })
	@ApiBody({ type: AchievementProgressDto })
	@ApiResponse({ status: 200, description: 'Cập nhật thành công' })
	async updateProgress(
		@Request() req,
		@Body() dto: AchievementProgressDto,
		@I18n() i18n: I18nContext,
	) {
		const userId = req.user.id;
		const result = await this.userAchievementRepo.updateAchievementProgress(
			userId,
			dto.achievementId,
			dto.progress ?? 0,
		);
		return {
			success: true,
			data: result,
			message: i18n.t('achievement.PROGRESS_UPDATE_SUCCESS'),
		};
	}
}
