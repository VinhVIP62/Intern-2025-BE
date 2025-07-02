import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, autoIndex: true })
export class Achievement extends Document {
	@Prop({ required: true, unique: true, index: true })
	name: string;

	@Prop({ required: true })
	description: string;

	@Prop({ required: true })
	icon: string;

	@Prop({ required: true })
	criteria: string; // JSON string describing the criteria

	@Prop({ default: true, index: true })
	isActive: boolean;

	createdAt?: Date;
	updatedAt?: Date;
}

export const AchievementSchema = SchemaFactory.createForClass(Achievement);

// Setup indexes for better performance
AchievementSchema.index({ isActive: 1, createdAt: -1 });
AchievementSchema.index({ name: 'text', description: 'text' });

// Virtual populate for user achievements
AchievementSchema.virtual('userAchievements', {
	ref: 'UserAchievement',
	localField: '_id',
	foreignField: 'achievementId',
});

// Ensure virtual fields are included when converting to JSON
AchievementSchema.set('toJSON', {
	virtuals: true,
	transform: function (doc, ret) {
		delete ret.id;
		return ret;
	},
});
AchievementSchema.set('toObject', {
	virtuals: true,
	transform: function (doc, ret) {
		delete ret.id;
		return ret;
	},
});
