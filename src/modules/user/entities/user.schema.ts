import { Role, Status } from '@common/enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import MongooseDelete from 'mongoose-delete';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongoose';
import { uniqueArrayFieldValidator } from '@common/validator';
import { Location, Sport, User } from './user.entity';

/*
  Omit<User, 'deletedBy'> to get away with
  typing of the deletedBy field
  not being able to find a middleground for string and ObjectId
 */
@Schema({ timestamps: true })
export class UserDocument implements Omit<User, 'deletedBy'> {
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

	@Prop({ default: false })
	hasFinishedSetup: boolean = false;

	createdAt: Date;
	updatedAt: Date;
	deleted: boolean;
	deletedBy: ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);

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
