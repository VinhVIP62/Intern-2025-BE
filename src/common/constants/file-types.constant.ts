export const FILE_TYPE_CONSTANTS = {
	// Image types
	ALLOWED_IMAGE_MIME_TYPES: [
		'image/jpeg',
		'image/jpg',
		'image/png',
		'image/gif',
		'image/webp',
		'image/bmp',
		'image/svg+xml',
	] as const,

	ALLOWED_IMAGE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'] as const,

	// Video types
	ALLOWED_VIDEO_MIME_TYPES: [
		'video/mp4',
		'video/avi',
		'video/mov',
		'video/wmv',
		'video/flv',
		'video/webm',
		'video/mkv',
		'video/x-m4v',
		'video/3gpp',
		'video/ogg',
	] as const,

	ALLOWED_VIDEO_EXTENSIONS: [
		'.mp4',
		'.avi',
		'.mov',
		'.wmv',
		'.flv',
		'.webm',
		'.mkv',
		'.m4v',
		'.3gp',
		'.ogv',
	] as const,

	// File size limits
	MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB for Cloudinary
	MAX_FILES_COUNT: 10,

	// Cloudinary resource types
	CLOUDINARY_RESOURCE_TYPES: {
		IMAGE: 'image',
		VIDEO: 'video',
		RAW: 'raw',
	} as const,
} as const;

export type AllowedImageMimeType = (typeof FILE_TYPE_CONSTANTS.ALLOWED_IMAGE_MIME_TYPES)[number];
export type AllowedVideoMimeType = (typeof FILE_TYPE_CONSTANTS.ALLOWED_VIDEO_MIME_TYPES)[number];
export type AllowedImageExtension = (typeof FILE_TYPE_CONSTANTS.ALLOWED_IMAGE_EXTENSIONS)[number];
export type AllowedVideoExtension = (typeof FILE_TYPE_CONSTANTS.ALLOWED_VIDEO_EXTENSIONS)[number];
export type CloudinaryResourceType =
	(typeof FILE_TYPE_CONSTANTS.CLOUDINARY_RESOURCE_TYPES)[keyof typeof FILE_TYPE_CONSTANTS.CLOUDINARY_RESOURCE_TYPES];
