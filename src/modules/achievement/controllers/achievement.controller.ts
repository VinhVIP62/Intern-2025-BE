import { Controller, Get, Post, Body, Request, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { RolesGuard } from '@common/guards';
import { Roles } from '@common/decorators';
import { Role } from '@common/enum';
import { IAchievementRepository } from '@modules/achievement/repositories/achievement.repository';
import { AchievementProgressDto } from '@modules/achievement/dto/request/achievement-progress.dto';
import { IUserAchievementRepository } from '@modules/achievement/repositories/user-achievement.repository';
import { AchievementService } from '@modules/achievement/providers/achievement.service';

@ApiTags('Achievement')
@Controller('achievements')
export class AchievementController {
	constructor(
		private readonly achievementRepo: IAchievementRepository,
		private readonly userAchievementRepo: IUserAchievementRepository,
		private readonly achievementService: AchievementService,
	) {}

	@Get('all')
	@ApiOperation({ summary: 'Lấy tất cả achievement có thể đạt được' })
	@ApiResponse({ status: 200, description: 'Lấy thành công' })
	async getAllAchievements(@I18n() i18n: I18nContext) {
		const achievements = await this.achievementRepo.findAllAchievements();
		const achievementsWithName = achievements.map(achievement => ({
			...achievement,
			name: i18n.t(`achievement.${achievement.name}`),
		}));
		return {
			success: true,
			total: achievements.length,
			data: achievementsWithName,
			message: i18n.t('achievement.LIST_SUCCESS'),
		};
	}

	@Get('personal')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Lấy achievement và tiến trình thực hiện của user hiện tại' })
	@ApiResponse({ status: 200, description: 'Lấy thành công' })
	async getUserAchievements(@Request() req, @I18n() i18n: I18nContext) {
		const userId = req.user.id;
		const allAchievements = await this.achievementRepo.findAllAchievements();
		const userAchievements = await this.userAchievementRepo.findUserAchievements(userId);

		const passed = userAchievements.filter(a => a.progress === 100).length;
		const inProgress = userAchievements.filter(a => a.progress < 100).length;
		const total = allAchievements.length;

		const achievementsWithName = allAchievements.map(achievement => ({
			...achievement,
			name: i18n.t(`achievement.${achievement.name}`),
		}));
		return {
			success: true,
			total,
			passed,
			inProgress,
			data: achievementsWithName,
			message: i18n.t('achievement.USER_LIST_SUCCESS'),
		};
	}

	@Post('unlock')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Unlock achievement cho user thủ công' })
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
	@ApiOperation({ summary: 'Cập nhật tiến trình achievement cho user thủ công' })
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

	@Post('auto-update')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Tự động check và update achievement cho user hiện tại' })
	@ApiResponse({ status: 200, description: 'Cập nhật và unlock thành công' })
	async autoUpdateAchievements(@Request() req, @I18n() i18n: I18nContext) {
		const userId = req.user.id;
		const userStats = await this.achievementService.buildUserStatsDto(userId);
		await this.achievementService.checkAndUnlockAchievements(userId, userStats, i18n);
		await this.achievementService.trackProgress(userId, userStats);
		return {
			success: true,
			message: i18n.t('achievement.AUTO_UPDATE_SUCCESS'),
		};
	}
}
