import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, autoIndex: true })
export class UserAchievement extends Document {
	@Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
	userId: Types.ObjectId;

	@Prop({ type: Types.ObjectId, ref: 'Achievement', required: true, index: true })
	achievementId: Types.ObjectId;

	@Prop({ default: Date.now, index: true })
	unlockedAt: Date;

	@Prop({ default: null })
	progress: number; // for progressive achievements

	@Prop({ index: true })
	createdAt?: Date;

	@Prop({ index: true })
	updatedAt?: Date;
}

export const UserAchievementSchema = SchemaFactory.createForClass(UserAchievement);

// Setup indexes for better performance
UserAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });
UserAchievementSchema.index({ userId: 1, unlockedAt: -1 });
UserAchievementSchema.index({ achievementId: 1, unlockedAt: -1 });
UserAchievementSchema.index({ userId: 1, createdAt: -1 });
UserAchievementSchema.index({ achievementId: 1, createdAt: -1 });

// Virtual populate for user
UserAchievementSchema.virtual('user', {
	ref: 'User',
	localField: 'userId',
	foreignField: '_id',
	justOne: true,
});

// Virtual populate for achievement
UserAchievementSchema.virtual('achievement', {
	ref: 'Achievement',
	localField: 'achievementId',
	foreignField: '_id',
	justOne: true,
});

// Ensure virtual fields are included when converting to JSON
UserAchievementSchema.set('toJSON', { virtuals: true });
UserAchievementSchema.set('toObject', { virtuals: true });
