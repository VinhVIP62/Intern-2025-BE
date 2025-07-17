import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { WithPopulated } from '@common/crud/entities';
import { Complete } from '@common/types/utils';

import { SocialPost } from '@modules/post/entities';
import { User } from '@modules/user/entities';

import { Comment } from './comment.entity';

@Schema({
	timestamps: true,
	toObject: {
		virtuals: true,
	},
})
export class CommentSchemaDef implements WithPopulated<Complete<Comment>> {
	_id!: string;
	@Virtual({
		get: function (this: CommentSchemaDef) {
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

	@Prop({ type: mongoose.Schema.Types.ObjectId, index: true, ref: SocialPost.name, required: true })
	postId!: string;

	@Prop({ type: mongoose.Schema.Types.ObjectId, index: true, required: true })
	targetId!: string;

	@Prop({ type: [String], default: null })
	fileUrls!: string[] | null;

	@Virtual({
		options: {
			ref: Comment.name,
			localField: '_id',
			foreignField: 'targetId',
			count: true,
		},
	})
	childrenCount!: number;

	@Prop({ type: String, required: true })
	content!: string;

	createdAt!: Date;
	updatedAt!: Date;

	@Prop({ type: Boolean, default: false, index: true })
	deleted!: boolean;

	@Prop({ type: Date, default: null })
	deletedAt!: Date | null;

	@Prop({ type: mongoose.Schema.Types.ObjectId, default: null, index: true, ref: User.name })
	deletedBy!: string | null;

	@Virtual({
		options: {
			ref: User.name,
			localField: 'deletedBy',
			foreignField: '_id',
			justOne: true,
		},
	})
	deletedByPopulated!: User;
}

export const CommentSchema = SchemaFactory.createForClass(CommentSchemaDef);
export type CommentDocument = HydratedDocument<Comment>;

CommentSchema.index({ createdAt: 1 });
CommentSchema.index({ updatedAt: 1 });
