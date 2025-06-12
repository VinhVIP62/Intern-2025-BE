import { Comment } from '../../entities/comment.entity';
import { IBaseRepository } from './base.repository.interface';

export interface ICommentRepository extends IBaseRepository<Comment> {
  findByPost(postId: string): Promise<Comment[]>;
  findByAuthor(authorId: string): Promise<Comment[]>;
  findByParent(parentId: string): Promise<Comment[]>;
  addLike(commentId: string, userId: string): Promise<boolean>;
  removeLike(commentId: string, userId: string): Promise<boolean>;
  incrementReplyCount(commentId: string): Promise<boolean>;
  decrementReplyCount(commentId: string): Promise<boolean>;
  setActive(commentId: string, isActive: boolean): Promise<boolean>;
}
