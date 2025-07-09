import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
	timestamps: true,
})
export class Token {
	@Prop({ required: true })
	token: string;

	@Prop({ required: true })
	userId: string;

	@Prop({ required: true })
	type: string;

	@Prop({ required: true })
	expiresAt: Date;
}
export const TokenSchema = SchemaFactory.createForClass(Token);
