import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Achievement extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  icon: string;

  @Prop({ required: true })
  criteria: string; // JSON string describing the criteria

  @Prop({ default: true })
  isActive: boolean;
}

export const AchievementSchema = SchemaFactory.createForClass(Achievement);
