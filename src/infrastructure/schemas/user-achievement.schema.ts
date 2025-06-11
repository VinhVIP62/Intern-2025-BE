import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class UserAchievement extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Achievement', required: true })
  achievementId: Types.ObjectId;

  @Prop({ default: Date.now })
  unlockedAt: Date;

  @Prop({ default: null })
  progress: number; // for progressive achievements
}

export const UserAchievementSchema = SchemaFactory.createForClass(UserAchievement);
