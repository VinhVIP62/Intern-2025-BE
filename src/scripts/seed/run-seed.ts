import mongoose from 'mongoose';

// Import seed data từ file seed.ts
import {
	userSeeds,
	groupSeeds,
	friendRequestSeeds,
	commentSeeds,
	achievementSeeds,
	userAchievementSeeds,
	postSeeds,
	eventSeeds,
	notificationSeeds,
} from './seed';

// Import mongoose models
import { User, UserSchema } from '../../modules/user/entities/user.schema';
import { Group, GroupSchema } from '../../modules/group/entities/group.schema';
import {
	FriendRequest,
	FriendRequestSchema,
} from '../../modules/friend-request/entities/friend-request.schema';
import { Comment, CommentSchema } from '../../modules/comment/entities/comment.schema';
import {
	Achievement,
	AchievementSchema,
} from '../../modules/achievement/entities/achievement.schema';
import {
	UserAchievement,
	UserAchievementSchema,
} from '../../modules/achievement/entities/user-achievement.schema';
import { Post, PostSchema } from '../../modules/post/entities/post.schema';
import { Event, EventSchema } from '../../modules/event/entities/event.schema';
import {
	Notification,
	NotificationSchema,
} from '../../modules/notification/entities/notification.schema';

const MONGO_URI = process.env.DATABASE_URI || 'mongodb://localhost:27017/alobo-sport-hub';

async function run() {
	await mongoose.connect(MONGO_URI);

	// Đăng ký models nếu chưa đăng ký
	const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
	const GroupModel = mongoose.models.Group || mongoose.model('Group', GroupSchema);
	const FriendRequestModel =
		mongoose.models.FriendRequest || mongoose.model('FriendRequest', FriendRequestSchema);
	const CommentModel = mongoose.models.Comment || mongoose.model('Comment', CommentSchema);
	const AchievementModel =
		mongoose.models.Achievement || mongoose.model('Achievement', AchievementSchema);
	const UserAchievementModel =
		mongoose.models.UserAchievement || mongoose.model('UserAchievement', UserAchievementSchema);
	const PostModel = mongoose.models.Post || mongoose.model('Post', PostSchema);
	const EventModel = mongoose.models.Event || mongoose.model('Event', EventSchema);
	const NotificationModel =
		mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

	// Thêm seed data
	await UserModel.insertMany(userSeeds);
	await GroupModel.insertMany(groupSeeds);
	await FriendRequestModel.insertMany(friendRequestSeeds);
	await CommentModel.insertMany(commentSeeds);
	await AchievementModel.insertMany(achievementSeeds);
	await UserAchievementModel.insertMany(userAchievementSeeds);
	await PostModel.insertMany(postSeeds);
	await EventModel.insertMany(eventSeeds);
	await NotificationModel.insertMany(notificationSeeds);

	console.log('✅ Seed data inserted!');
	await mongoose.disconnect();
}

run().catch(err => {
	console.error('❌ Seed error:', err);
	process.exit(1);
});
