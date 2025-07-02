export enum PostType {
	TEXT = 'text',
	IMAGE = 'image',
	VIDEO = 'video',
	EVENT = 'event',
}

export enum PostStatus {
	PENDING = 'pending',
	APPROVED = 'approved',
	REJECTED = 'rejected',
}

export enum PostAccessLevel {
	PUBLIC = 'public',
	PRIVATE = 'private',
	PROTECTED = 'protected', // chỉ cho phép bạn bè xem
}
