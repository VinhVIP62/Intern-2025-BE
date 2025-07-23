import { Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { WithPopulated } from '@common/crud/entities';
import { BaseEntitySchemaDef } from '@common/crud/entities/mongoose-schema';
import { Complete } from '@common/types/utils';

import { User } from '@modules/user/entities';

import { EventParticipant, EventParticipantRole } from './event-participant.entity';

export class EventParticipantSchemaDef
	extends BaseEntitySchemaDef
	implements WithPopulated<Complete<EventParticipant>>
{
	@Prop({ type: mongoose.Schema.Types.ObjectId, index: true, ref: User.name, required: true })
	userId!: string;

	@Prop({ type: String, enum: EventParticipantRole, default: EventParticipantRole.GUEST })
	role!: EventParticipantRole;
}

export const EventParticipantSchema = SchemaFactory.createForClass(EventParticipantSchemaDef);
export type EventParticipantDocument = HydratedDocument<EventParticipant>;
