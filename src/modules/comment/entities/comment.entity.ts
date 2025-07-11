import { ISoftDeletableEntity } from '@common/crud/entities';

export class Comment implements ISoftDeletableEntity {
	id!: string;
	userId!: string;

	targetId!: string;

	content!: string;
	fileUrls!: string[] | null;

	childrenCount!: number;

	createdAt!: Date;
	updatedAt!: Date;
	deleted!: boolean;
	deletedAt!: Date | null;
	deletedBy!: string | null;
}
