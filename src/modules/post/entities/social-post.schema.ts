import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { WithPopulated } from '@common/crud/entities';
import { SoftDeletableEntitySchemaDef, toString } from '@common/crud/entities/mongoose-schema';
import { Visibility } from '@common/enums';
import { Complete } from '@common/types/utils';

import { User } from '@modules/user/entities';

import { PostType } from '../enums';
import { SocialPost } from './social-post.entity';

@Schema({
	timestamps: true,
	toObject: {
		virtuals: true,
		getters: true,
	},
})
export class SocialPostSchemaDef
	extends SoftDeletableEntitySchemaDef
	implements WithPopulated<Complete<SocialPost>>
{
	@Prop({ type: String, enum: Visibility, required: true, index: true })
	visibility!: Visibility;

	@Prop({ type: String, index: 'text', required: true })
	title!: string;

	@Prop({ type: String, index: 'text', required: true })
	content!: string;

	@Prop({ type: [String], default: null })
	fileUrls!: string[] | null;

	// [PLA] not implemented
	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null, get: toString })
	embeddedEventId!: string | null;

	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		ref: SocialPost.name,
		default: null,
		get: toString,
	})
	parentPostId!: string | null;

	@Virtual({
		options: {
			ref: SocialPost.name,
			localField: 'parentPostId',
			foreignField: '_id',
			justOne: true,
		},
	})
	parentPostIdPopulated!: any;

	@Prop({ type: String, enum: PostType, required: true, default: PostType.FILES })
	postType!: PostType;

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

	// [PLAN] not implemented
	@Prop({ type: [mongoose.Schema.Types.ObjectId], default: null, ref: 'Group', get: toString })
	visibleToCommunityId!: string | null;

	@Prop({
		type: [mongoose.Schema.Types.ObjectId],
		default: null,
		ref: User.name,
		index: true,
		get: toString,
	})
	visibleToUsersIds!: string[];

	@Virtual({
		options: {
			ref: User.name,
			localField: 'visibleToUsersIds',
			foreignField: '_id',
			justOne: false,
		},
	})
	visibleToUsersIdsPopulated!: any[];

	@Prop({
		type: [mongoose.Schema.Types.ObjectId],
		default: null,
		ref: User.name,
		index: true,
		get: toString,
	})
	invisibleToUsersIds!: string[];

	@Virtual({
		options: {
			ref: User.name,
			localField: 'invisibleToUsersIds',
			foreignField: '_id',
			justOne: false,
		},
	})
	invisibleToUsersIdsPopulated!: any[];
}

export const SocialPostSchema = SchemaFactory.createForClass(SocialPostSchemaDef);
export type SocialPostDocument = HydratedDocument<SocialPost>;

SocialPostSchema.index({ createdAt: 1 });
SocialPostSchema.index({ updatedAt: 1 });
