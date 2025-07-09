import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import {
	AuthModule,
	EventModule,
	FileModule,
	FriendModule,
	NotificationModule,
	PostModule,
	SearchModule,
	UserModule,
} from '../modules';

@Module({
	imports: [
		RouterModule.register([
			{
				path: '',
				children: [
					{ path: '', module: AuthModule },
					{ path: '', module: EventModule },
					{ path: '', module: FileModule },
					{ path: '', module: FriendModule },
					{ path: '', module: NotificationModule },
					{ path: '', module: PostModule },
					{ path: '', module: SearchModule },
					{ path: '', module: UserModule },
				],
			},
		]),
		AuthModule,
		EventModule,
		FileModule,
		FriendModule,
		NotificationModule,
		PostModule,
		SearchModule,
		UserModule,
	],
})
export class RouteModule {}
