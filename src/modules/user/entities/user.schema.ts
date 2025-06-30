import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';
import mongoose, { HydratedDocument, ValidatorProps } from 'mongoose';

import { Level, Role, Status } from '@common/enums';
import { Complete } from '@common/types/utils';
import { nonNullAfterCreate, uniqueArrayFieldValidator } from '@common/validators';

import { GoogleLoginInfo, Location, Sport, User } from './user.entity';

@Schema({ _id: false })
export class LocationSubDoc implements Location {
	@Prop({ type: String, index: true })
	province!: string | null;

	@Prop({ type: String, index: true })
	city!: string | null;

	@Prop({ index: true })
	hidden!: boolean;
}

@Schema({ _id: false })
export class SportSubDoc implements Sport {
	@Prop({ type: String, enum: Level })
	level!: Level;

	@Prop()
	name!: string;
}

@Schema({ _id: false })
export class GoogleLoginInfoSubDoc implements GoogleLoginInfo {
	@Prop({ type: String, index: true })
	id!: string | null;
}

@Schema({
	timestamps: true,
	toObject: {
		virtuals: true,
	},
})
export class UserSchemaDef implements Complete<User> {
	_id!: mongoose.Types.ObjectId;

	@Virtual({
		get: function (this: UserSchemaDef) {
			return this._id.toString();
		},
	})
	id!: string;

	@Prop({ required: true, unique: true })
	username!: string;

	@Prop({
		type: String,
		validate: {
			validator: nonNullAfterCreate,
			message: (props: ValidatorProps) => `${props.path} must be updated with a non-null value`,
		},
	})
	password!: string | null;

	@Prop({ type: [String], enum: Role, default: [] })
	roles!: Role[];

	@Prop({
		type: String,
		unique: true,
		sparse: true,
		validate: {
			validator: nonNullAfterCreate,
			message: (props: ValidatorProps) => `${props.path} must be updated with a non-null value`,
		},
		default: null,
	})
	mail!: string | null;

	@Prop({
		type: String,
		index: {
			unique: true,
			partialFilterExpression: { phone: { $type: 'string' } },
		},
		validate: {
			validator: nonNullAfterCreate,
			message: (props: ValidatorProps) => `${props.path} must be updated with a non-null value`,
		},
		default: null,
	})
	phone!: string | null;

	@Prop({ type: String, default: null })
	avatarUrl: string | null = null;

	@Prop({
		type: LocationSubDoc,
		default: (): Location => ({
			city: null,
			province: null,
			hidden: false,
		}),
	})
	location!: Location;

	@Prop({
		default: [],
		validate: {
			validator: uniqueArrayFieldValidator<Sport>('name'),
			message: (props: ValidatorProps) => `Each ${props.path} element must have unique name`,
		},
	})
	sports: Sport[] = [];

	@Prop({ type: String, enum: Status, default: Status.OFFlINE })
	status!: Status;

	@Prop({ default: false, index: true })
	hasFinishedSetup: boolean = false;

	@Prop({ type: GoogleLoginInfoSubDoc, default: undefined })
	googleLoginInfo: GoogleLoginInfo | undefined;

	createdAt!: Date;
	updatedAt!: Date;

	@Prop({ type: Boolean, default: false, index: true })
	deleted!: boolean;

	@Prop({ type: Date, default: null })
	deletedAt!: Date | null;

	/** references user id */
	@Prop({ type: String, default: null, index: true })
	deletedBy!: string | null;

	@Virtual({
		get: function (this: UserSchemaDef) {
			return this.deletedBy ? mongoose.Types.ObjectId.createFromHexString(this.deletedBy) : null;
		},
	})
	deletedByOID!: mongoose.Types.ObjectId | null;
}

export const UserSchema = SchemaFactory.createForClass(UserSchemaDef);
export type UserDocument = HydratedDocument<User>;

UserSchema.pre('save', function () {
	if (this.isModified('password') && this.password !== null) {
		const hashedPassword = bcrypt.hashSync(this.password, 10);
		this.password = hashedPassword;
	}
});

UserSchema.pre(['updateOne', 'findOneAndUpdate', 'updateMany'], function () {
	const password = this.get('password') as string | null;
	if (password) {
		const hashedPassword = bcrypt.hashSync(password, 10);
		this.set('password', hashedPassword);
	}
});
