import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Achievement,
  AchievementSchema,
  UserAchievement,
  UserAchievementSchema,
} from '@infrastructure/schemas';
import { AchievementService } from '@application/services/achievement.service';
import { AchievementController } from '@presentation/controllers/achievement.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Achievement.name, schema: AchievementSchema },
      { name: UserAchievement.name, schema: UserAchievementSchema },
    ]),
  ],
  controllers: [AchievementController],
  providers: [AchievementService],
  exports: [AchievementService],
})
export class AchievementModule {}
