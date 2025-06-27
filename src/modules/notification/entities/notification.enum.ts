export enum NotificationType {
	FRIEND_REQUEST = 'friend_request',
	EVENT_INVITATION = 'event_invitation',
	GROUP_INVITATION = 'group_invitation',
	LIKE = 'like',
	COMMENT = 'comment',
	POST_APPROVED = 'post_approved',
	POST_REJECTED = 'post_rejected',
	ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
	MENTION = 'mention',
	FOLLOW = 'follow',
	SHARE = 'share',
}

export enum ReferenceModel {
	POST = 'Post',
	EVENT = 'Event',
	GROUP = 'Group',
	COMMENT = 'Comment',
	USER = 'User',
	ACHIEVEMENT = 'Achievement',
	FRIEND_REQUEST = 'FriendRequest',
}
