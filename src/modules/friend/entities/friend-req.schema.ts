import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty, IsString } from 'class-validator';
@Schema({ timestamps: true })
export class FriendReq {
	@Prop()
	@IsNotEmpty()
	@IsString()
	senderId: string;

	@Prop()
	@IsNotEmpty()
	@IsString()
	receiverId: string;

	@Prop({ default: 'pending', enum: ['pending', 'accepted'] })
	status: string;

	@Prop()
	createdAt: Date;
}

export const FriendReqSchema = SchemaFactory.createForClass(FriendReq);
