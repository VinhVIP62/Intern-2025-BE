export interface IAchievementRepository {
	findAllAchievements(): Promise<any[]>;
}

export const IAchievementRepository = Symbol('IAchievementRepository');
