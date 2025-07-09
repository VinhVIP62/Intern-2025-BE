import { CreatePostDto } from '../dto/create-post.dto';
import { PostQueryDto } from '../dto/post-query.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { Post } from '../entities/post.schema';

export abstract class IPostRepository {
	abstract create(post: CreatePostDto): Promise<Post>;

	abstract findById(id: string): Promise<Post | null>;

	abstract findAll(): Promise<Post[]>;

	abstract findByUserId(userId: string): Promise<Post[]>;

	abstract update(id: string, post: UpdatePostDto): Promise<Post | null>;

	abstract delete(id: string): Promise<Post | null>;

	abstract findAllWithPagination(
		postQuery: PostQueryDto,
	): Promise<{ posts: Post[]; total: number }>;

	abstract likePost(userId: string, postId: string): Promise<Post | null>;

	abstract unlikePost(userId: string, post: Post): Promise<Post | null>;

	abstract search(query: any): Promise<Post[]>;
}
