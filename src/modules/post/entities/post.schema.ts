import { PostVisibility } from '@common/enum/post-visibility.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Post {
	@Prop({ type: Types.ObjectId, ref: 'User', required: true }) author: Types.ObjectId;
	@Prop() title: string;
	@Prop() content: string;
	@Prop([String]) imageUrls: string[];
	@Prop({ type: String, enum: PostVisibility, default: PostVisibility.Public })
	visibility: PostVisibility;

	@Prop({ type: Number, default: 0 })
	likeCount: number;

	@Prop({ type: Number, default: 0 })
	commentCount: number;
}

export type PostDocument = HydratedDocument<Post>;

export const PostSchema = SchemaFactory.createForClass(Post);
