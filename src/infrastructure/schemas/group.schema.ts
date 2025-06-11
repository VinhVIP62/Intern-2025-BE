import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SportType } from '@domain/enums/event.enum';

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
}

export const GroupSchema = SchemaFactory.createForClass(Group);
