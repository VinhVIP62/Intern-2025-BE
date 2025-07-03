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
	OtpModule,
	FileModule,
	SearchModule,
} from '@modules';
import { EmailModule } from '@modules/email/email.module';
@Module({
	imports: [
		AuthModule,
		EmailModule,
		EventModule,
		NotificationModule,
		PostModule,
		UserModule,
		GroupModule,
		CommentModule,
		FriendRequestModule,
		AchievementModule,
		OtpModule,
		FileModule,
		SearchModule,
	],
	exports: [
		AuthModule,
		EmailModule,
		EventModule,
		NotificationModule,
		PostModule,
		UserModule,
		GroupModule,
		CommentModule,
		FriendRequestModule,
		AchievementModule,
		OtpModule,
		FileModule,
		SearchModule,
	],
})
export class SharedModule {}
