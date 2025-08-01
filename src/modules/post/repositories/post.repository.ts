import { CreatePostDto } from '../dto/request/create-post.dto';
import { PostQueryDto } from '../dto/request/post-query.dto';
import { UpdatePostDto } from '../dto/request/update-post.dto';
import { Post, PostDocument } from '../entities/post.schema';
import {
	BasePostResponseDto,
	PostResponseDto,
	PostSearchResponseDto,
} from '../dto/response/post-response.dto';

export abstract class IPostRepository {
	abstract create(post: CreatePostDto): Promise<PostDocument>;

	abstract findById(id: string): Promise<BasePostResponseDto | null>;

	abstract findAll(): Promise<PostResponseDto[]>;

	abstract findByUserId(userId: string): Promise<PostResponseDto[]>;

	abstract update(id: string, post: UpdatePostDto): Promise<PostResponseDto | null>;

	abstract delete(id: string): Promise<PostDocument | null>;

	abstract findAllWithPagination(
		mongoQuery: any,
		query: any,
	): Promise<{ posts: PostResponseDto[]; total: number }>;

	abstract likePost(postId: string): Promise<PostResponseDto | null>;

	abstract unlikePost(postId: string): Promise<PostResponseDto | null>;

	abstract sharePost(postId: string, post: CreatePostDto): Promise<PostDocument | null>;

	abstract search(query: any): Promise<{ posts: PostSearchResponseDto[] }>;
}
