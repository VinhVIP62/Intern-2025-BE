import { ReactType } from '@common/enum/post/react.type.enum';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class ReactComment {
	@Prop({ required: true })
	userId: string; // UUID user React bình luận

	@Prop({ required: true })
	commentId: string; // UUID của bình luận được React

	@Prop({ required: true, enum: ReactType, type: String })
	type: ReactType;
}

export const ReactCommentSchema = SchemaFactory.createForClass(ReactComment);

ReactCommentSchema.index({ userId: 1, commentId: 1 }, { unique: true });
