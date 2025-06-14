// src/modules/user/entities/user.schema.ts
import { Role } from '@common/enum/roles.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';

@Schema({ timestamps: true })
export class User {
	_id: string;

	@Prop({ required: true, unique: true })
	username: string;

	@Prop({ required: true })
	password: string;

	@Prop({ default: [Role.USER] })
	roles: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', function () {
	const hashedPassword = bcrypt.hashSync(this.password, 10);
	this.password = hashedPassword;
});
