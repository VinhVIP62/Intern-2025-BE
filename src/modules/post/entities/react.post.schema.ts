import { ReactType } from '@common/enum/react.type.enum';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class React {
	@Prop({ required: true })
	userId: string; // UUID user React bài viết

	@Prop({ required: true })
	postId: string; // UUID của bài viết được React

	@Prop({ required: true, enum: ReactType, type: String })
	type: ReactType;
}

export const ReactSchema = SchemaFactory.createForClass(React);

ReactSchema.index({ userId: 1, postId: 1 }, { unique: true });
