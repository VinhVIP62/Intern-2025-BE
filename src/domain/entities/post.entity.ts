import { PostType } from '../enums/event.enum';

export class Post {
  id: string;
  author: string;
  content: string;
  type: PostType;
  images: string[];
  video?: string;
  eventId?: string;
  groupId?: string;
  likes: string[];
  hashtags: string[];
  taggedUsers: string[];
  sharedFrom?: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Post>) {
    Object.assign(this, partial);
  }
}
