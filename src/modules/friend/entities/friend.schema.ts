import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { FriendState } from '@common/enum/friend.state.enum';

@Schema({ timestamps: true })
export class Friend {
	@Prop({ required: true })
	fromUserId: string;

	@Prop({ required: true })
	toUserId: string;

	@Prop({
		enum: FriendState,
		default: FriendState.PENDING,
		type: String,
	})
	state: FriendState;
}

export const FriendSchema = SchemaFactory.createForClass(Friend);

FriendSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });
