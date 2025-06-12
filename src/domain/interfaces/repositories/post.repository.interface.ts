import { Post } from '../../entities/post.entity';
import { IBaseRepository } from './base.repository.interface';
import { PostType } from '../../enums/event.enum';

export interface IPostRepository extends IBaseRepository<Post> {
  findByAuthor(authorId: string): Promise<Post[]>;
  findByEvent(eventId: string): Promise<Post[]>;
  findByGroup(groupId: string): Promise<Post[]>;
  findByType(type: PostType): Promise<Post[]>;
  findByHashtag(hashtag: string): Promise<Post[]>;
  findByTaggedUser(userId: string): Promise<Post[]>;
  addLike(postId: string, userId: string): Promise<boolean>;
  removeLike(postId: string, userId: string): Promise<boolean>;
  incrementCommentCount(postId: string): Promise<boolean>;
  decrementCommentCount(postId: string): Promise<boolean>;
  incrementShareCount(postId: string): Promise<boolean>;
  decrementShareCount(postId: string): Promise<boolean>;
}
