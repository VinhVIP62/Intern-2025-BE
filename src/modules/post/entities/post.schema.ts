import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Privacy } from '@modules/post/enum/privacy.enum';
import { Image } from '@shared/schema/image.schema';
import { User } from '@modules/user/entities/user.schema';
export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
	_id: Types.ObjectId;

	@Prop()
	title: string;

	@Prop({ type: String, ref: User.name })
	userId: string;

	@Prop()
	content: string;

	@Prop({ type: [Image], default: [] })
	images: Image[];

	@Prop({ default: 0 })
	likeCount?: number = 0;

	@Prop({ default: Privacy.PUBLIC })
	privacy: string;

	@Prop({ default: 0 })
	shareCount: number;

	@Prop({ type: String, ref: Post.name })
	originalPostId: string;

	@Prop({ type: String, ref: User.name, default: null })
	originalPostUserId: string;

	@Prop({ default: null })
	originalPrivacy: string;

	@Prop()
	createdAt: Date;

	@Prop()
	updatedAt: Date;
}
export const PostSchema = SchemaFactory.createForClass(Post);
//for better query performance
PostSchema.index({ userId: 1, createdAt: -1 }); // For user posts, newest first
PostSchema.index({ createdAt: -1 }); // For all posts, newest first
PostSchema.index({ content: 'text', title: 'text' });
