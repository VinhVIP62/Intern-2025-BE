import { Achievement } from '../../entities/achievement.entity';
import { IBaseRepository } from './base.repository.interface';

export interface IAchievementRepository extends IBaseRepository<Achievement> {
  findByName(name: string): Promise<Achievement | null>;
  findByCriteria(criteria: string): Promise<Achievement[]>;
  setActive(achievementId: string, isActive: boolean): Promise<boolean>;
  findActive(): Promise<Achievement[]>;
}
