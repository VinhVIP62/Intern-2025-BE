import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserAchievement } from '@modules/achievement/entities/user-achievement.schema';
import { IUserAchievementRepository } from '@modules/achievement/interfaces/user-achievement.repository';

@Injectable()
export class UserAchievementRepositoryImpl implements IUserAchievementRepository {
	constructor(
		@InjectModel('UserAchievement') private readonly userAchievementModel: Model<UserAchievement>,
	) {}

	async findUserAchievements(userId: string): Promise<UserAchievement[]> {
		return this.userAchievementModel.find({ userId }).populate('achievement').lean();
	}

	async unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement> {
		return this.userAchievementModel.findOneAndUpdate(
			{ userId, achievementId },
			{ $set: { unlockedAt: new Date(), progress: 100 } },
			{ upsert: true, new: true },
		);
	}

	async updateAchievementProgress(
		userId: string,
		achievementId: string,
		progress: number,
	): Promise<UserAchievement> {
		return this.userAchievementModel.findOneAndUpdate(
			{ userId, achievementId },
			{ $set: { progress } },
			{ upsert: true, new: true },
		);
	}
}
