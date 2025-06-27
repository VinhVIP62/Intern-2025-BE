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
	],
})
export class SharedModule {}
