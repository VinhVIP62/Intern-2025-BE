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
	],
})
export class SharedModule {}
