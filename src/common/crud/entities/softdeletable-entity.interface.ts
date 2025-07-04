import { IBaseEntity } from './base-entity.interface';

export interface ISoftDeletableEntity extends IBaseEntity {
	deleted: boolean;
	deletedBy: string | null;
	deletedAt: Date | null;
}
