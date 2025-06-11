import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole, ActivityLevel } from '@domain/enums/user.enum';
import { SportType } from '@domain/enums/event.enum';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: null })
  refToken: string;

  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ default: null })
  avatar: string;

  @Prop({ default: null })
  coverImage: string;

  @Prop({ default: null })
  bio: string;

  @Prop({ type: Date, default: null })
  dateOfBirth: Date;

  @Prop({ default: null })
  phone: string;

  @Prop({
    type: {
      city: String,
      district: String,
      address: String,
    },
    default: null,
  })
  location: {
    city: string;
    district: string;
    address: string;
  };

  @Prop({ type: [String], enum: SportType, default: [] })
  favoritesSports: SportType[];

  @Prop({
    type: Map,
    of: String,
    enum: ActivityLevel,
    default: new Map(),
  })
  skillLevels: Map<SportType, ActivityLevel>;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  friends: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  following: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  followers: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Group' }], default: [] })
  joinedGroups: Types.ObjectId[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);
