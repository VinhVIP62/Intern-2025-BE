import { FriendStatus } from '@modules/friend/enum/friendStatus.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { User } from '@modules/user/entities/user.schema';

@Schema({ timestamps: true })
export class FriendReq {
	_id: Types.ObjectId;

	@Prop({ type: String, ref: User.name })
	@IsNotEmpty()
	@IsString()
	sender: string;

	@Prop({ type: String, ref: User.name })
	@IsNotEmpty()
	@IsString()
	receiver: string;

	@Prop({ default: FriendStatus.PENDING, enum: [FriendStatus.PENDING, FriendStatus.ACCEPTED] })
	status: string;

	@Prop()
	createdAt: Date;
}

export const FriendReqSchema = SchemaFactory.createForClass(FriendReq);
