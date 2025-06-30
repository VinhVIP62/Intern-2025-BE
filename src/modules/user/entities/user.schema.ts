// src/modules/user/entities/user.schema.ts
import { Role } from '@common/enum/roles.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

@Schema({ timestamps: true })
export class User {
	_id: string;

	@Prop({
		default: () => randomUUID(),
		unique: true,
		index: true,
	})
	id: string; // UUID dùng để public

	@Prop({ required: false, unique: true, sparse: true })
	email: string;

	@Prop({ required: false, unique: true, sparse: true })
	phone: string;

	@Prop({ required: true, unique: true, index: true })
	username: string;

	@Prop({ required: true })
	password: string;

	@Prop({ type: [String], enum: Role, default: [Role.USER] })
	roles: string[];

	@Prop({ default: false })
	isBanned: boolean;

	@Prop({ default: 0 })
	reportCount: number;

	@Prop({ default: false })
	isOnline: boolean;

	@Prop({ default: () => new Date() })
	lastSeen: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', function () {
	const hashedPassword = bcrypt.hashSync(this.password, 10);
	this.password = hashedPassword;
});
