import { Gender } from '@common/enum/gender.enum';
import { SportLevel } from '@common/enum/sport-level.enum';
import { Sports } from '@common/enum/sports.enum';
import { Prop, Schema } from '@nestjs/mongoose';
import { SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Profile {
	_id: string;

	@Prop({
		type: String,
		ref: 'User',
		required: true,
		unique: true,
	})
	userId: string;

	// Thông tin cá nhân
	@Prop({ required: true })
	firstName: string;
	@Prop({ required: true })
	lastName: string;
	@Prop({ required: false })
	bio: string;

	// Hình ảnh đại diện
	@Prop({ required: false })
	avatarUrl: string;
	@Prop({ required: false })
	coverUrl: string;

	// Ngày sinh
	@Prop({ required: true })
	birthday: Date;
	// Giới tính
	@Prop({ required: true, enum: Gender })
	gender: string;
	// Địa chỉ
	@Prop({ required: false })
	address: string;

	@Prop({
		type: [String],
		enum: Sports,
		default: [],
	})
	sportInterests: Sports[];

	@Prop({
		type: [String],
		enum: SportLevel,
		default: [],
	})
	sportLevel: SportLevel[];

	@Prop({ default: [] })
	friendIds: string[];

	@Prop({ default: [] })
	friendRequestsFrom: string[];

	@Prop({ default: [] })
	friendRequestsTo: string[];
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
