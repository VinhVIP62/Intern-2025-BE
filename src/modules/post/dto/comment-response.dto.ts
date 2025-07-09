import { Expose } from 'class-transformer';

export class CommentResponseDto {
	@Expose()
	_id: string;

	@Expose()
	userId: string;

	@Expose()
	postId: string;

	@Expose()
	content: string;

	@Expose()
	likedUserIds: string[];

	@Expose()
	rootCommentId?: string;

	@Expose()
	parentCommentId?: string;

	@Expose()
	isOriginal: boolean;

	@Expose()
	replyCount: number;

	@Expose()
	createdAt: Date;

	@Expose()
	updatedAt: Date;
}
