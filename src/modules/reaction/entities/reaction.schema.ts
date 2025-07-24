import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { WithPopulated } from '@common/crud/entities';
import { BaseEntitySchemaDef, toString } from '@common/crud/entities/mongoose-schema';
import { Complete } from '@common/types/utils';

import { User } from '@modules/user/entities';

import { Reaction } from './reaction.entity';

@Schema({
	timestamps: true,
	toObject: {
		virtuals: true,
		getters: true,
	},
})
export class ReactionSchemaDef
	extends BaseEntitySchemaDef
	implements WithPopulated<Complete<Reaction>>
{
	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		index: true,
		ref: User.name,
		required: true,
		get: toString,
	})
	userId!: string;

	@Virtual({
		options: {
			ref: User.name,
			localField: 'userId',
			foreignField: '_id',
			justOne: true,
		},
	})
	userIdPopulated!: any;

	@Prop({ type: mongoose.Schema.Types.ObjectId, index: true, required: true, get: toString })
	targetId!: string;

	@Prop({ type: Number })
	reactionValue!: number;
}

export const ReactionSchema = SchemaFactory.createForClass(ReactionSchemaDef);
export type ReactionDocument = HydratedDocument<Reaction>;

ReactionSchema.index({ userId: 1, targetId: 1 }, { unique: true });
