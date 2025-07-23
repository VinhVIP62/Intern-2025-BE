import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ValidatorProps } from 'mongoose';

import { WithPopulated } from '@common/crud/entities';
import { BaseEntitySchemaDef, toString } from '@common/crud/entities/mongoose-schema';
import { Complete } from '@common/types/utils';

import { User } from '@modules/user/entities';

import { FriendStatus, Friendship } from './friendship.entity';

@Schema({
	timestamps: true,
	toObject: {
		virtuals: true,
		getters: true,
	},
})
export class FriendshipSchemaDef
	extends BaseEntitySchemaDef
	implements WithPopulated<Complete<Friendship>>
{
	@Prop({
		type: [mongoose.Schema.Types.ObjectId],
		ref: User.name,
		required: true,
		index: true,
		unique: true,
		validate: {
			validator: (val: string[]) => val.length == 2,
			message: (props: ValidatorProps) => `${props.path} array must have strictly 2 mongo ObjecId`,
		},
		immutable: true,
		get: toString,
	})
	userIds!: [string, string];

	@Prop({ type: String, enum: FriendStatus, required: true })
	status!: FriendStatus;
}

export const FriendshipSchema = SchemaFactory.createForClass(FriendshipSchemaDef);
export type FriendshipDocument = HydratedDocument<Friendship>;

FriendshipSchema.pre('save', function () {
	if (this.isNew) {
		this.userIds.sort();
	}
});
