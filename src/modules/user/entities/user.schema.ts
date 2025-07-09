// src/modules/user/entities/user.schema.ts
import { Role } from '@common/enum/roles.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsStrongPassword } from 'class-validator';
@Schema({ timestamps: true })
export class User {
	_id: string;

	@Prop()
	@IsStrongPassword()
	password?: string;

	@Prop({ default: [Role.USER] })
	roles: string[];

	@Prop([{ type: String }])
	phoneNumbers?: string[];

	@Prop([{ type: String }])
	emails?: string[];

	@Prop()
	externalId?: string;

	@Prop()
	externalType?: string;

	@Prop()
	fullName?: string;

	@Prop()
	avatar?: string;

	@Prop()
	avatarPublicId?: string;

	@Prop({ enum: ['male', 'female'] })
	gender?: string;

	@Prop()
	birthday?: Date;

	@Prop({ default: null })
	description?: string;

	@Prop({ default: null })
	background?: string;

	@Prop({ default: null })
	backgroundPublicId?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Create unique indexes for individual emails and phone numbers
UserSchema.index({ emails: 1 }, { unique: true, sparse: true });
UserSchema.index({ phoneNumbers: 1 }, { unique: true, sparse: true });

//handle expired account not verified
//userSchema.index({ createdAt: 1 }, { expireAfterSeconds: 900, partialFilterExpression: { isVerified: false } });

// Pre-save middleware for password hashing (commented out since we hash in service)
// UserSchema.pre('save', function () {
// 	const hashedPassword = bcrypt.hashSync(this.password, 10);
// 	this.password = hashedPassword;
// });
