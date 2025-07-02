import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SportType } from '@modules/user/enums/user.enum';

// Group Schema
@Schema({ timestamps: true })
export class Group extends Document {
	@Prop({ required: true, trim: true })
	name: string;

	@Prop({ default: null })
	description: string;

	@Prop({ default: null })
	avatar: string;

	@Prop({ default: null })
	coverImage: string;

	@Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
	admins: Types.ObjectId[];

	@Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
	members: Types.ObjectId[];

	@Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
	waitingList: Types.ObjectId[];

	@Prop({ type: String, enum: SportType, required: true })
	sport: SportType;

	@Prop({
		type: {
			city: String,
			district: String,
		},
		default: null,
	})
	location: {
		city: string;
		district: string;
	};

	@Prop({ default: false })
	isPrivate: boolean;

	@Prop({ default: 0 })
	memberCount: number;

	@Prop({ default: false })
	requirePostApproval: boolean;

	@Prop({ default: true })
	autoApproveAdminPosts: boolean;

	// Remove duplicate index declarations since timestamps: true handles them
	createdAt?: Date;
	updatedAt?: Date;
}

export const GroupSchema = SchemaFactory.createForClass(Group);

// Setup indexes for better performance
GroupSchema.index({ name: 1 });
GroupSchema.index({ sport: 1, createdAt: -1 });
GroupSchema.index({ isPrivate: 1, createdAt: -1 });
GroupSchema.index({ 'location.city': 1 });
GroupSchema.index({ 'location.district': 1 });

// Text search index for groups
GroupSchema.index({ name: 'text', description: 'text' });

// Virtual populate for admins
GroupSchema.virtual('adminUsers', {
	ref: 'User',
	localField: 'admins',
	foreignField: '_id',
});

// Virtual populate for members
GroupSchema.virtual('memberUsers', {
	ref: 'User',
	localField: 'members',
	foreignField: '_id',
});

// Virtual populate for waiting list
GroupSchema.virtual('waitingListUsers', {
	ref: 'User',
	localField: 'waitingList',
	foreignField: '_id',
});

// Virtual populate for posts in this group
GroupSchema.virtual('posts', {
	ref: 'Post',
	localField: '_id',
	foreignField: 'groupId',
});

// Virtual populate for events in this group
GroupSchema.virtual('events', {
	ref: 'Event',
	localField: '_id',
	foreignField: 'groupId',
});

// Ensure virtual fields are included when converting to JSON
GroupSchema.set('toJSON', {
	virtuals: true,
	transform: function (doc, ret) {
		delete ret.id;
		return ret;
	},
});
