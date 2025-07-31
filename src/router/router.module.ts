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
import { ChatModule } from '@modules/chat/chat.module';
import { FirebaseModule } from '@modules/firebase/firebase.module';
import { BlockModule } from '@modules/block/block.module';

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
					{ path: '', module: ChatModule },
					{ path: '', module: FirebaseModule },
					{ path: '', module: BlockModule },
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
		ChatModule,
		FirebaseModule,
		BlockModule,
	],
})
export class RouteModule {}
