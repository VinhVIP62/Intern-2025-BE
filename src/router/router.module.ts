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
import { SearchModule } from '../shared/search/search.module';

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
	],
})
export class RouteModule {}
