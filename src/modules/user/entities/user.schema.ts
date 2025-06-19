// src/modules/user/entities/user.schema.ts
import { Role } from '@common/enum/roles.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';

@Schema({ timestamps: true, autoIndex: true })
export class User {
	_id: string;

	@Prop({ required: true, unique: true, index: true })
	username: string;

	@Prop({ required: true })
	password: string;

	@Prop({ default: [Role.USER], index: true })
	roles: string[];

	@Prop({ unique: true, sparse: true, index: true })
	email?: string;

	@Prop({ index: true })
	createdAt?: Date;

	@Prop({ index: true })
	updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Pre-save hook để hash password
UserSchema.pre('save', function () {
	if (this.isModified('password')) {
		const hashedPassword = bcrypt.hashSync(this.password, 10);
		this.password = hashedPassword;
	}
});

// Tạo compound indexes cho performance
UserSchema.index({ username: 1, roles: 1, createdAt: -1 });
UserSchema.index({ email: 1, roles: 1 });
UserSchema.index({ createdAt: -1, updatedAt: -1 });

// Text index cho search functionality
UserSchema.index({ username: 'text', email: 'text' });
