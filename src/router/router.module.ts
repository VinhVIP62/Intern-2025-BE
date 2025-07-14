import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import {
	AuthModule,
	AdminModule,
	EventModule,
	NotificationModule,
	PostModule,
	UserModule,
} from '../modules';
import { FriendModule } from '@modules/friend/friend.module';
import { ChatModule } from 'src/chatbot/chat.module';
import { SearchModule } from '@modules/search/search.module';

@Module({
	imports: [
		RouterModule.register([
			{
				path: 'admin',
				children: [{ path: 'admin', module: AdminModule }],
			},
			{
				path: 'client',
				children: [
					{ path: 'auth', module: AuthModule },
					{ path: 'events', module: EventModule },
					{ path: 'notifications', module: NotificationModule },
					{ path: 'posts', module: PostModule },
					{ path: 'users', module: UserModule },
					{ path: 'search', module: SearchModule },
				],
			},
		]),
		AuthModule,
		AdminModule,
		EventModule,
		NotificationModule,
		PostModule,
		UserModule,
		FriendModule,
		ChatModule,
		SearchModule,
	],
})
export class RouteModule {}
