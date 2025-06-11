import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PostType } from '@domain/enums/event.enum';

@Schema({ timestamps: true })
export class Post extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ type: String, enum: PostType, default: PostType.TEXT })
  type: PostType;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ default: null })
  video: string;

  @Prop({ type: Types.ObjectId, ref: 'Event', default: null })
  eventId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Group', default: null })
  groupId: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  likes: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  hashtags: string[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  taggedUsers: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Post', default: null })
  sharedFrom: Types.ObjectId;

  @Prop({ default: 0 })
  likeCount: number;

  @Prop({ default: 0 })
  commentCount: number;

  @Prop({ default: 0 })
  shareCount: number;
}

export const PostSchema = SchemaFactory.createForClass(Post);
