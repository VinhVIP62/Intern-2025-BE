import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Achievement, AchievementSchema } from './entities/achievement.schema';
import { AchievementController } from './controllers/achievement.controller';
import { AchievementService } from './providers/achievement.service';
import { IAchievementRepository } from './repositories/achievement.repository';
import { AchievementRepositoryImpl } from './repositories/achievement.repository.impl';

@Module({
	imports: [MongooseModule.forFeature([{ name: Achievement.name, schema: AchievementSchema }])],
	controllers: [AchievementController],
	providers: [
		AchievementService,
		{ provide: IAchievementRepository, useClass: AchievementRepositoryImpl },
	],
	exports: [AchievementService],
})
export class AchievementModule {}
