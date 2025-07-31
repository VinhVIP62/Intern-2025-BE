import { PostVisibility } from '@common/enum/post-visibility.enum';
import { Location, LocationSchema } from '@modules/location/entities/location.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Post {
	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	author: Types.ObjectId;

	@Prop()
	title: string;

	@Prop()
	content: string;

	@Prop({
		type: [
			{
				_id: false,
				url: { type: String, required: true },
				type: {
					type: String,
					required: true,
					enum: ['image', 'video', 'audio', 'file'],
				},
			},
		],
		default: [],
	})
	media: {
		url: string;
		type: 'image' | 'video' | 'audio' | 'file';
	}[];

	@Prop({ type: [Types.ObjectId], ref: 'Sport', default: [] })
	sports: Types.ObjectId[];

	@Prop({ type: LocationSchema })
	location: Location;

	@Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
	taggedFriends: Types.ObjectId[];

	@Prop([String])
	hashtags: string[];

	@Prop({ type: String, enum: PostVisibility, default: PostVisibility.Public })
	visibility: PostVisibility;

	@Prop({ type: Types.ObjectId, ref: 'Post', default: null })
	sharedPost?: Types.ObjectId | null;

	@Prop({ type: Number, default: 0 })
	likeCount: number;

	@Prop({ type: Number, default: 0 })
	commentCount: number;
}

export type PostDocument = HydratedDocument<Post>;

export interface PostDocumentWithRestricted extends PostDocument {
	sharedPostIsRestricted?: boolean;
}

export const PostSchema = SchemaFactory.createForClass(Post);
