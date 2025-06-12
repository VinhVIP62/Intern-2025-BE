import { UserAchievement } from '../../entities/user-achievement.entity';
import { IBaseRepository } from './base.repository.interface';

export interface IUserAchievementRepository extends IBaseRepository<UserAchievement> {
  findByUser(userId: string): Promise<UserAchievement[]>;
  findByAchievement(achievementId: string): Promise<UserAchievement[]>;
  findByUserAndAchievement(userId: string, achievementId: string): Promise<UserAchievement | null>;
  updateProgress(userId: string, achievementId: string, progress: number): Promise<boolean>;
  findUnlockedByUser(userId: string): Promise<UserAchievement[]>;
  findLockedByUser(userId: string): Promise<UserAchievement[]>;
}
