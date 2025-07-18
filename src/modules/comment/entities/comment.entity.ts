import { IBaseEntity } from '@common/crud/entities';

export enum CommentRootType {
	POST = 'post',
}

export class Comment implements IBaseEntity {
	id!: string;
	userId!: string;

	rootId!: string;
	rootType!: CommentRootType;
	targetId!: string;

	content!: string;
	fileUrls!: string[] | null;

	childrenCount!: number;

	createdAt!: Date;
	updatedAt!: Date;
}
