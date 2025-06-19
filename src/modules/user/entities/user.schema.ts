// src/modules/user/entities/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import bcrypt from 'bcrypt';
import { ActivityLevel, SportType } from '../enums/user.enum';
import { Role } from '@common/enum';

@Schema({ timestamps: true, autoIndex: true })
export class User extends Document {
	@Prop({ required: true, unique: true, lowercase: true, index: true })
	email: string;

	@Prop({ required: true })
	password: string;

	@Prop({ default: null })
	refToken: string;

	@Prop({ required: true, trim: true })
	firstName: string;

	@Prop({ required: true, trim: true })
	lastName: string;

	@Prop({ default: null })
	avatar: string;

	@Prop({ default: null })
	coverImage: string;

	@Prop({ default: null })
	bio: string;

	@Prop({ type: Date, default: null })
	dateOfBirth: Date;

	@Prop({ default: null })
	phone: string;

	@Prop({
		type: {
			city: String,
			district: String,
			address: String,
		},
		default: null,
	})
	location: {
		city: string;
		district: string;
		address: string;
	};

	@Prop({ type: [String], enum: SportType, default: [] })
	favoritesSports: SportType[];

	@Prop({
		type: Map,
		of: String,
		enum: ActivityLevel,
		default: new Map(),
	})
	skillLevels: Map<SportType, ActivityLevel>;

	@Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
	friends: Types.ObjectId[];

	@Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
	following: Types.ObjectId[];

	@Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
	followers: Types.ObjectId[];

	@Prop({ type: [{ type: Types.ObjectId, ref: 'Group' }], default: [] })
	joinedGroups: Types.ObjectId[];

	@Prop({ default: true })
	isActive: boolean; // optional, use for messaging

	@Prop({ default: false })
	isVerified: boolean; // optional, for email verification

	@Prop({ type: [String], enum: Role, default: [Role.USER] })
	roles: Role[];

	@Prop({ index: true })
	createdAt?: Date;

	@Prop({ index: true })
	updatedAt?: Date;

	// Virtual field for fullName
	get fullName(): string {
		return `${this.firstName} ${this.lastName}`.trim();
	}
}

export const UserSchema = SchemaFactory.createForClass(User);

// Virtual field configuration
UserSchema.virtual('fullName')
	.get(function () {
		return `${this.firstName} ${this.lastName}`.trim();
	})
	.set(function (value: string) {
		const parts = value.split(' ');
		this.firstName = parts[0] || '';
		this.lastName = parts.slice(1).join(' ') || '';
	});

// Ensure virtual fields are included when converting to JSON
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

// Pre-save hook để hash password
UserSchema.pre('save', function () {
	if (this.isModified('password')) {
		const hashedPassword = bcrypt.hashSync(this.password, 10);
		this.password = hashedPassword;
	}
});

// Tạo compound indexes cho performance
UserSchema.index({ email: 1, role: 1 });
UserSchema.index({ firstName: 1, lastName: 1 });
UserSchema.index({ createdAt: -1, updatedAt: -1 });
UserSchema.index({ favoritesSports: 1 });
UserSchema.index({ isActive: 1, isVerified: 1 });

// Text index cho search functionality
UserSchema.index({ firstName: 'text', lastName: 'text', email: 'text', bio: 'text' });
