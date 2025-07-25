export interface IUserAchievementRepository {
	findUserAchievements(userId: string): Promise<any[]>;
	unlockAchievement(userId: string, achievementId: string): Promise<any>;
	updateAchievementProgress(userId: string, achievementId: string, progress: number): Promise<any>;
}

export const IUserAchievementRepository = Symbol('IUserAchievementRepository');
