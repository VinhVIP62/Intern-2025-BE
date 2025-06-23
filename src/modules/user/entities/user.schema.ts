// src/modules/user/entities/user.schema.ts
import { Role } from '@common/enum/roles.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';

@Schema({ timestamps: true })
export class User {
	_id: string;

	@Prop()
	password: string;

	@Prop({ default: [Role.USER] })
	roles: string[];

	@Prop({ unique: true })
	phoneNumber?: string;
	@Prop({ unique: true })
	email?: string;
	@Prop()
	externalId?: string;
	@Prop()
	externalType?: string;

	@Prop()
	fullName?: string;

	@Prop()
	avatar?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', function () {
	const hashedPassword = bcrypt.hashSync(this.password, 10);
	this.password = hashedPassword;
});
