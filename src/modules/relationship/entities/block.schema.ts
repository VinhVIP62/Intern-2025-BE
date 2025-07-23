import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { WithPopulated } from '@common/crud/entities';
import { BaseEntitySchemaDef } from '@common/crud/entities/mongoose-schema';
import { Complete } from '@common/types/utils';

import { User } from '@modules/user/entities';

import { Block } from './block.entity';

@Schema({
	timestamps: true,
	toObject: {
		virtuals: true,
	},
})
export class BlockSchemaDef extends BaseEntitySchemaDef implements WithPopulated<Complete<Block>> {
	@Prop({ type: mongoose.Schema.Types.ObjectId, index: true, ref: User.name, required: true })
	fromUserId!: string;

	@Prop({ type: mongoose.Schema.Types.ObjectId, index: true, ref: User.name, required: true })
	toUserId!: string;
}

export const BlockSchema = SchemaFactory.createForClass(BlockSchemaDef);
export type BlockDocument = HydratedDocument<Block>;
