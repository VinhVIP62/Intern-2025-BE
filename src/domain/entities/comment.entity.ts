export class Comment {
  id: string;
  postId: string;
  author: string;
  content: string;
  parentId?: string;
  likes: string[];
  isActive: boolean;
  likeCount: number;
  replyCount: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Comment>) {
    Object.assign(this, partial);
  }
}
