import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../user/entities/user.schema';
import { JoinStatus } from '../enum/joinStatus.enum';

export type JoinEventDocument = JoinEvent & Document;

@Schema({ timestamps: true, collection: 'join_event' })
export class JoinEvent {
	_id: Types.ObjectId;

	@Prop({ required: true, type: String, ref: User.name })
	userId: string;

	@Prop({ required: true })
	eventId: string;

	@Prop({ required: true, default: JoinStatus.PENDING, enum: JoinStatus })
	status: string;

	@Prop()
	createdAt: Date;
}

export const JoinEventSchema = SchemaFactory.createForClass(JoinEvent);
