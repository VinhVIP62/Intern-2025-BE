import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import {
	AuthModule,
	AdminModule,
	EventModule,
	FriendModule,
	PostModule,
	UserModule,
} from '../modules';
import { SearchModule } from '@modules/search/search.module';
import { NotificationModule } from '@modules/notification/notification.module';

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
					{ path: 'friends', module: FriendModule },
					{ path: 'posts', module: PostModule },
					{ path: 'users', module: UserModule },
					{ path: 'search', module: SearchModule },
					{ path: 'notifications', module: NotificationModule },
				],
			},
		]),
		AuthModule,
		AdminModule,
		EventModule,
		FriendModule,
		PostModule,
		UserModule,
		SearchModule,
		NotificationModule,
	],
})
export class RouteModule {}
