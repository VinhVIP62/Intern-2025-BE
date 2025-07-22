import { IBaseEntity } from '@common/crud/entities';

export class Reaction extends IBaseEntity {
	userId!: string;
	targetId!: string;

	// representing the emoji
	reactionValue!: number;
}
