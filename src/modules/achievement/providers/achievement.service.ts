import { Injectable, Inject } from '@nestjs/common';
import { AchievementCriteriaKey } from '../achievement-criteria.constant';
import { UserStatsDto } from '../dto/user-stats.dto';
import { IAchievementRepository } from '../repositories/achievement.repository';
import { IUserAchievementRepository } from '../repositories/user-achievement.repository';

@Injectable()
export class AchievementService {
	constructor(
		@Inject(IAchievementRepository)
		private readonly achievementRepo: IAchievementRepository,
		@Inject(IUserAchievementRepository)
		private readonly userAchievementRepo: IUserAchievementRepository,
	) {}

	// Kiểm tra và unlock achievement cho user
	async checkAndUnlockAchievements(userId: string, userStats: UserStatsDto) {
		const achievements = await this.achievementRepo.findAllAchievements();
		for (const achievement of achievements) {
			const criteria = JSON.parse(achievement.criteria);
			let isUnlocked = true;
			if (criteria[AchievementCriteriaKey.COMPLETE_PROFILE] && !userStats.completeProfile)
				isUnlocked = false;
			if (criteria[AchievementCriteriaKey.JOIN_FIRST_GROUP] && !userStats.joinFirstGroup)
				isUnlocked = false;
			if (
				criteria[AchievementCriteriaKey.LOGIN_STREAK] &&
				userStats.loginStreak < criteria[AchievementCriteriaKey.LOGIN_STREAK]
			)
				isUnlocked = false;
			if (
				criteria[AchievementCriteriaKey.FRIEND_COUNT] &&
				userStats.friendCount < criteria[AchievementCriteriaKey.FRIEND_COUNT]
			)
				isUnlocked = false;
			if (
				criteria[AchievementCriteriaKey.CREATE_EVENT] &&
				userStats.createEvent < criteria[AchievementCriteriaKey.CREATE_EVENT]
			)
				isUnlocked = false;
			if (
				criteria[AchievementCriteriaKey.JOIN_EVENT] &&
				userStats.joinEvent < criteria[AchievementCriteriaKey.JOIN_EVENT]
			)
				isUnlocked = false;
			if (
				criteria[AchievementCriteriaKey.POST_COUNT] &&
				userStats.postCount < criteria[AchievementCriteriaKey.POST_COUNT]
			)
				isUnlocked = false;
			if (!isUnlocked) continue;
			const userAchievements = await this.userAchievementRepo.findUserAchievements(userId);
			const existed = userAchievements.find(
				ua => ua.achievementId.toString() === achievement._id.toString(),
			);
			if (!existed) {
				await this.userAchievementRepo.unlockAchievement(userId, achievement._id);
			}
		}
	}

	// Theo dõi tiến trình achievement (cho các achievement dạng tích lũy)
	async trackProgress(userId: string, userStats: UserStatsDto) {
		const achievements = await this.achievementRepo.findAllAchievements();
		for (const achievement of achievements) {
			const criteria = JSON.parse(achievement.criteria);
			let progress: number | null = null;
			let required: number | null = null;

			if (criteria[AchievementCriteriaKey.FRIEND_COUNT]) {
				required = criteria[AchievementCriteriaKey.FRIEND_COUNT];
				if (required) {
					progress = Math.min((userStats.friendCount / required) * 100, 100);
				}
			} else if (criteria[AchievementCriteriaKey.JOIN_EVENT]) {
				required = criteria[AchievementCriteriaKey.JOIN_EVENT];
				if (required) {
					progress = Math.min((userStats.joinEvent / required) * 100, 100);
				}
			} else if (criteria[AchievementCriteriaKey.POST_COUNT]) {
				required = criteria[AchievementCriteriaKey.POST_COUNT];
				if (required) {
					progress = Math.min((userStats.postCount / required) * 100, 100);
				}
			}

			if (progress !== null) {
				await this.userAchievementRepo.updateAchievementProgress(userId, achievement._id, progress);

				// Nếu progress đạt 100% thì unlock achievement
				if (progress >= 100) {
					await this.userAchievementRepo.unlockAchievement(userId, achievement._id);
				}
			}
		}
	}
}
