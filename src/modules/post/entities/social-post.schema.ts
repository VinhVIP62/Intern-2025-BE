import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { WithPopulated } from '@common/crud/entities';
import { Visibility } from '@common/enums';
import { Complete } from '@common/types/utils';

import { User } from '@modules/user/entities';

import { PostType } from '../enums';
import { SocialPost } from './social-post.entity';

@Schema({
	timestamps: true,
	toObject: {
		virtuals: true,
	},
})
export class SocialPostSchemaDef implements WithPopulated<Complete<SocialPost>> {
	_id!: mongoose.Types.ObjectId;

	@Virtual({
		get: function (this: SocialPostSchemaDef) {
			return this._id.toString();
		},
	})
	id!: string;

	@Prop({ type: String, enum: Visibility, required: true, index: true })
	visibility!: Visibility;

	@Prop({ type: String, index: 'text', required: true })
	title!: string;

	@Prop({ type: String, index: 'text', required: true })
	content!: string;

	@Prop({ type: [String], default: null })
	fileUrls!: string[] | null;

	// [PLA] not implemented
	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null })
	embeddedEventId!: string | null;

	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: SocialPost.name, default: null })
	parentPostId!: string | null;

	@Virtual({
		options: {
			ref: SocialPost.name,
			localField: 'parentPostId',
			foreignField: '_id',
			justOne: true,
		},
	})
	parentPostIdPopulated!: Partial<SocialPost> | null;

	@Prop({ type: String, enum: PostType, required: true, default: PostType.FILES })
	postType!: PostType;

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

	// [PLAN] not implemented
	@Prop({ type: [mongoose.Schema.Types.ObjectId], default: null, ref: 'Group' })
	visibleToCommunityId!: string | null;

	@Prop({ type: [mongoose.Schema.Types.ObjectId], default: null, ref: User.name, index: true })
	visibleToUsersIds!: string[];

	@Virtual({
		options: {
			ref: User.name,
			localField: 'visibleToUsersIds',
			foreignField: '_id',
			justOne: false,
		},
	})
	visibleToUsersIdsPopulated!: User[];

	@Prop({ type: [mongoose.Schema.Types.ObjectId], default: null, ref: User.name, index: true })
	invisibleToUsersIds!: string[];

	@Virtual({
		options: {
			ref: User.name,
			localField: 'invisibleToUsersIds',
			foreignField: '_id',
			justOne: false,
		},
	})
	invisibleToUsersIdsPopulated!: User[];
}

export const SocialPostSchema = SchemaFactory.createForClass(SocialPostSchemaDef);
export type SocialPostDocument = HydratedDocument<SocialPost>;

SocialPostSchema.index({ createdAt: 1 });
SocialPostSchema.index({ updatedAt: 1 });
