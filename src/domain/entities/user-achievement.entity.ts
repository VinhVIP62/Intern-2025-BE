export class UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: Date;
  progress?: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<UserAchievement>) {
    Object.assign(this, partial);
  }
}
