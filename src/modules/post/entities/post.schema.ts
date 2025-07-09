import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsIn } from 'class-validator';

@Schema({ timestamps: true })
export class Post {
	_id: string;

	@Prop()
	title: string;

	@Prop()
	userId: string;

	@Prop()
	content: string;

	@Prop({ default: [] })
	images?: string[];

	@Prop()
	imagesIds?: string[];

	@Prop({ default: [] })
	likedUserIds?: string[];

	@Prop()
	@IsIn(['public', 'private', 'friends'])
	privacy: string;

	@Prop({ default: 0 })
	shareCount: number;

	@Prop()
	createdAt: Date;
}
export const PostSchema = SchemaFactory.createForClass(Post);
//for better query performance
PostSchema.index({ userId: 1, createdAt: -1 }); // For user posts, newest first
PostSchema.index({ createdAt: -1 }); // For all posts, newest first
