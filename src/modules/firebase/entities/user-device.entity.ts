import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class UserDevice {
	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	userId: Types.ObjectId;

	@Prop({ required: true })
	token: string;

	@Prop({ enum: ['ios', 'android', 'web'], default: 'web' })
	platform: 'ios' | 'android' | 'web';

	@Prop({ default: true })
	isActive: boolean;
}

export type UserDeviceDocument = HydratedDocument<UserDevice>;
export const UserDeviceSchema = SchemaFactory.createForClass(UserDevice);
