// src/modules/user/entities/user.schema.ts
import { Role } from '@common/enum/roles.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Schema as MongooseSchema } from 'mongoose';
import bcrypt from 'bcrypt';
import { Location, LocationSchema } from '@modules/location/entities/location.schema';

@Schema({ timestamps: true })
export class User {
	_id: string;

	@Prop({ required: true, unique: true })
	email: string;

	@Prop({ required: false })
	password: string;

	@Prop({ required: false })
	fullName: string;

	@Prop({ enum: ['male', 'female', 'other'], required: false })
	gender?: 'male' | 'female' | 'other';

	@Prop({ required: false })
	dateOfBirth?: Date;

	@Prop({ required: false })
	avatarUrl: string;

	@Prop({ required: false, type: LocationSchema })
	location: Location;

	@Prop({
		type: [
			{
				_id: false,
				sport: {
					type: MongooseSchema.Types.ObjectId,
					ref: 'Sport',
					required: true,
				},
				level: {
					type: String,
					enum: ['beginner', 'intermediate', 'advanced'],
					required: true,
					default: 'beginner',
				},
			},
		],
		default: [],
	})
	sports: {
		sport: Types.ObjectId;
		level: 'beginner' | 'intermediate' | 'advanced';
	}[];

	@Prop({ enum: ['google', null], default: null })
	oauthProvider: string;

	@Prop({ default: Date.now })
	createdAt: Date;

	@Prop({ default: [Role.USER] })
	roles: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (next) {
	if (this.isModified('password') && this.password) {
		this.password = await bcrypt.hash(this.password, 10);
	}
	next();
});
