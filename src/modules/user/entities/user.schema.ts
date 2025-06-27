import { Level, Role, Status } from '@common/enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import MongooseDelete from 'mongoose-delete';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongoose';
import { uniqueArrayFieldValidator } from '@common/validator';

export class Location {
	province: string | null = null;
	city: string | null = null;
	hidden: boolean = false;
}

export class Sport {
	name: string;
	level: Level;
}

export const LocationSchema = SchemaFactory.createForClass(Location);

@Schema({ timestamps: true })
export class User {
	_id: string;

	@Prop({ required: true, unique: true })
	username: string;

	@Prop({ required: true })
	password: string;

	@Prop({ type: [String], enum: Role, default: [] })
	roles: Role[];

	@Prop({ required: true, unique: true })
	mail: string;

	@Prop({ required: true, unique: true })
	phone: string;

	@Prop({ type: String, default: null })
	avatarUrl: string | null = null;

	@Prop({
		type: Location,
		default: new Location(),
	})
	location: Location;

	@Prop({
		type: [Sport],
		default: [],
		validate: {
			validator: uniqueArrayFieldValidator<Sport>('name'),
			message: 'Each sport element must have a unique name',
		},
	})
	sports: Sport[] = [];

	@Prop({ type: String, enum: Status, default: Status.OFFlINE })
	status: Status;

	// after registration user has to finish setting up
	@Prop({ default: false })
	hasFinishedSetup: boolean = false;

	// auto generated fields
	createdAt: Date;
	updatedAt: Date;
	deleted: boolean;
	deletedBy: ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', function () {
	if (this.isModified('password')) {
		const hashedPassword = bcrypt.hashSync(this.password, 10);
		this.password = hashedPassword;
	}
});

UserSchema.pre(['updateOne', 'findOneAndUpdate', 'updateMany'], function () {
	const password = this.get('password') as string | undefined;
	if (password) {
		const hashedPassword = bcrypt.hashSync(password, 10);
		this.set('password', hashedPassword);
	}
});

UserSchema.plugin(MongooseDelete, { deletedBy: true });
