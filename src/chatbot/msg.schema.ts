import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class BotChat {
	@Prop({ required: true })
	userId: string;
	@Prop({ required: true })
	message: string;
}

export const BotChatSchema = SchemaFactory.createForClass(BotChat);
