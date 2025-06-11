import { Module } from '@nestjs/common';
import { UserModule } from './user.module';
import { GroupModule } from './group.module';
import { EventModule } from './event.module';
import { PostModule } from './post.module';
import { NotificationModule } from './notification.module';
import { AchievementModule } from './achievement.module';

@Module({
  imports: [UserModule, GroupModule, EventModule, PostModule, NotificationModule, AchievementModule]
})
export class AuthModule {}
