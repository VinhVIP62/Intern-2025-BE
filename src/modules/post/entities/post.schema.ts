import { ReactType } from '@common/enum/react.type.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';

@Schema({ timestamps: true })
export class Post {
	@Prop({
		default: () => randomUUID(),
		index: true,
	})
	id: string;

	@Prop({
		type: String,
		ref: 'User',
		required: true,
		index: true,
	})
	userId: string; // UUID của owner

	@Prop({ required: true })
	title: string;

	@Prop({ required: true })
	content: string;

	@Prop({ type: [String], default: [] })
	taggedUserIds: string[]; // UUID của user được tag

	// @Prop({ type: [String], default: [] })
	// hashtags: string[]; // Hashtag đã được loại bỏ ký tự #

	@Prop({ type: [String], default: [] })
	mediaUrls: string[];

	@Prop({ default: 0 })
	reportCount: number;

	@Prop({ type: Map, of: Number, default: {} })
	reactsCount: Map<ReactType, number>;

	@Prop({ default: 0 })
	commentsCount: number;

	@Prop({ default: false })
	isDeleted: boolean;
}

export const PostSchema = SchemaFactory.createForClass(Post);
