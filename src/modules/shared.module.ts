import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@infrastructure/config/config.module';
import { LoggerModule } from '@infrastructure/logger/logger.module';
import { UserService } from '@application/services/user.service';
import { GroupService } from '@application/services/group.service';
import { NotificationService } from '@application/services/notification.service';
import { AuthService } from '@application/services/auth.service';
import { EventService } from '@application/services/event.service';
import { CommentService } from '@application/services/comment.service';
import { PostService } from '@application/services/post.service';
import { AchievementService } from '@application/services/achievement.service';

@Global()
@Module({
  imports: [ConfigModule, LoggerModule],
  providers: [
    UserService,
    GroupService,
    NotificationService,
    AuthService,
    EventService,
    CommentService,
    PostService,
    AchievementService,
  ],
  exports: [
    ConfigModule,
    LoggerModule,
    UserService,
    GroupService,
    NotificationService,
    AuthService,
    EventService,
    CommentService,
    PostService,
    AchievementService,
  ],
})
export class SharedModule {}
