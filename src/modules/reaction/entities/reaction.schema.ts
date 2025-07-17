import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { WithPopulated } from '@common/crud/entities';
import { Complete } from '@common/types/utils';

import { User } from '@modules/user/entities';

import { Reaction } from './reaction.entity';

@Schema({
	timestamps: true,
	toObject: {
		virtuals: true,
	},
})
export class ReactionSchemaDef implements WithPopulated<Complete<Reaction>> {
	_id!: string;
	@Virtual({
		get: function (this: ReactionSchemaDef) {
			return this._id.toString();
		},
	})
	id!: string;

	@Prop({ type: mongoose.Schema.Types.ObjectId, index: true, ref: User.name, required: true })
	userId!: string;

	@Virtual({
		options: {
			ref: User.name,
			localField: 'userId',
			foreignField: '_id',
			justOne: true,
		},
	})
	userIdPopulated!: User;

	@Prop({ type: mongoose.Schema.Types.ObjectId, index: true, required: true })
	targetId!: string;

	@Prop({ type: Number })
	reactionValue!: number;

	createdAt!: Date;
	updatedAt!: Date;
}

export const ReactionSchema = SchemaFactory.createForClass(ReactionSchemaDef);
export type ReactionDocument = HydratedDocument<Reaction>;

ReactionSchema.index({ userId: 1, targetId: 1 }, { unique: true });
