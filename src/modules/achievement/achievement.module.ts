import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Achievement, AchievementSchema } from './entities/achievement.schema';
import { AchievementController } from './controllers/achievement.controller';
import { AchievementService } from './providers/achievement.service';
import { IAchievementRepository } from './repositories/achievement.repository';
import { AchievementRepositoryImpl } from './repositories/achievement.repository.impl';
import { IUserAchievementRepository } from './repositories/user-achievement.repository';
import { UserAchievementRepositoryImpl } from './repositories/user-achievement.repository.impl';
import { UserAchievement, UserAchievementSchema } from './entities/user-achievement.schema';
import { UserModule } from '@modules/user/user.module';
import { EventModule } from '@modules/event/event.module';
import { PostModule } from '@modules/post/post.module';
import { NotificationModule } from '@modules/notification/notification.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Achievement.name, schema: AchievementSchema },
			{ name: UserAchievement.name, schema: UserAchievementSchema },
		]),
		forwardRef(() => UserModule),
		forwardRef(() => EventModule),
		forwardRef(() => PostModule),
		forwardRef(() => NotificationModule),
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
