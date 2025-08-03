import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'node:crypto';
import { ReactType } from '@common/enum/post/react.type.enum';

@Schema({ timestamps: true })
export class Comment {
	@Prop({
		default: () => randomUUID(),
		index: true,
		required: true,
	})
	id: string;

	@Prop({ required: true })
	userId: string;

	@Prop({ required: true })
	postId: string;

	@Prop({ type: [String], default: [] })
	taggedUserIds: string[]; // UUID của user được tag

	@Prop({ required: false, default: null })
	parentId?: string;

	@Prop({ required: true })
	content: string;

	@Prop({ type: Map, of: Number, default: {} })
	reactsCount: Map<ReactType, number>;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
