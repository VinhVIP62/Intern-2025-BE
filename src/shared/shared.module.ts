import { Module } from '@nestjs/common';
import {
	AuthModule,
	EventModule,
	NotificationModule,
	PostModule,
	UserModule,
	GroupModule,
	CommentModule,
	FriendRequestModule,
	AchievementModule,
} from '@modules';

@Module({
	imports: [
		AuthModule,
		EventModule,
		NotificationModule,
		PostModule,
		UserModule,
		GroupModule,
		CommentModule,
		FriendRequestModule,
		AchievementModule,
	],
	exports: [
		AuthModule,
		EventModule,
		NotificationModule,
		PostModule,
		UserModule,
		GroupModule,
		CommentModule,
		FriendRequestModule,
		AchievementModule,
	],
})
export class SharedModule {}
