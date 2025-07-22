import { IBaseEntity } from '@common/crud/entities';

export enum CommentRootType {
	POST = 'post',
}

export class Comment extends IBaseEntity {
	userId!: string;

	rootId!: string;
	rootType!: CommentRootType;
	targetId!: string;

	content!: string;
	fileUrls!: string[] | null;

	childrenCount!: number;
}
