import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@infrastructure/config/config.module';
import { LoggerModule } from '@infrastructure/logger/logger.module';
import { DatabaseModule } from '@modules/database.module';
import { UserModule } from './user.module';
import { PostModule } from './post.module';
import { CommentModule } from './comment.module';
import { GroupModule } from './group.module';
import { EventModule } from './event.module';
import { NotificationModule } from './notification.module';
import { AchievementModule } from './achievement.module';

@Global()
@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    DatabaseModule,
    UserModule,
    PostModule,
    CommentModule,
    GroupModule,
    EventModule,
    NotificationModule,
    AchievementModule,
  ],
  exports: [
    ConfigModule,
    LoggerModule,
    DatabaseModule,
    UserModule,
    PostModule,
    CommentModule,
    GroupModule,
    EventModule,
    NotificationModule,
    AchievementModule,
  ],
})
export class SharedModule {}
