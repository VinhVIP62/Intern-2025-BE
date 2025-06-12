import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { AuthModule } from '../modules/auth/auth.module';
import { UserModule } from '../modules/user/user.module';
import { FeedModule } from '../modules/feed/feed.module';
import { PostModule } from '../modules/post/post.module';
import { InteractionModule } from '../modules/interaction/interaction.module';
import { EventModule } from '../modules/event/event.module';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: '/',
        children: [
          { path: 'auth', module: AuthModule },
          { path: 'users', module: UserModule },
          { path: 'feeds', module: FeedModule },
          { path: 'posts', module: PostModule },
          { path: 'interactions', module: InteractionModule },
          { path: 'events', module: EventModule },
        ],
      },
    ]),
    AuthModule,
    UserModule,
    FeedModule,
    PostModule,
    InteractionModule,
    EventModule,
    SharedModule,
  ],
})
export class RouteModule {}
