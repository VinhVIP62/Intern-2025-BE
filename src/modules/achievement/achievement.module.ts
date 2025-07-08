import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Achievement, AchievementSchema } from './entities/achievement.schema';
import { AchievementController } from './controllers/achievement.controller';
import { AchievementService } from './providers/achievement.service';
import { IAchievementRepository } from './repositories/achievement.repository';
import { AchievementRepositoryImpl } from './repositories/achievement.repository.impl';
import { IUserAchievementRepository } from './repositories/user-achievement.repository';
import { UserAchievementRepositoryImpl } from './repositories/user-achievement.repository.impl';
import { UserAchievement, UserAchievementSchema } from './entities/user-achievement.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Achievement.name, schema: AchievementSchema },
			{ name: UserAchievement.name, schema: UserAchievementSchema },
		]),
	],
	controllers: [AchievementController],
	providers: [
		AchievementService,
		{ provide: IAchievementRepository, useClass: AchievementRepositoryImpl },
		{ provide: IUserAchievementRepository, useClass: UserAchievementRepositoryImpl },
	],
	exports: [AchievementService],
})
export class AchievementModule {}
