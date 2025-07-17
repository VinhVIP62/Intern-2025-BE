import { IBaseEntity } from '@common/crud/entities';

export class Reaction implements IBaseEntity {
	id!: string;
	userId!: string;
	targetId!: string;

	// representing the emoji
	reactionValue!: number;
	createdAt!: Date;
	updatedAt!: Date;
}
