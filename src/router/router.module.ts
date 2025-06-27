import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import {
	AuthModule,
	AdminModule,
	EventModule,
	NotificationModule,
	PostModule,
	UserModule,
	DevModule,
} from '@modules';
import { ConditionalModule } from '@nestjs/config';

@Module({
	imports: [
		RouterModule.register([
			{
				path: 'admin',
				module: AdminModule,
			},
			{
				path: 'client',
				children: [
					{ path: 'auth', module: AuthModule },
					{ path: 'events', module: EventModule },
					{ path: 'notifications', module: NotificationModule },
					{ path: 'posts', module: PostModule },
					{ path: 'users', module: UserModule },
				],
			},
			{
				path: 'dev',
				module: DevModule,
			},
		]),
		/* dev modules for testing */
		ConditionalModule.registerWhen(
			DevModule,
			(env: NodeJS.ProcessEnv) => env.NODE_ENV === 'development',
		),
		/* production modules */
		AuthModule,
		AdminModule,
		EventModule,
		NotificationModule,
		PostModule,
		UserModule,
	],
})
export class RouteModule {}
