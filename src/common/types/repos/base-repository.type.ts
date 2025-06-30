export interface IBaseRepository<T extends object> {
	create(data: Partial<T>): Promise<T>;
	update(id: string, data: Partial<T>): Promise<T>;
	delete(id: string): Promise<T | null>;
	findOneById(id: string): Promise<T | null>;
	findOneBy(where: Partial<T>): Promise<T | null>;
	find(where: Partial<T>): Promise<T[]>;
}

export interface ISoftDeleteBaseRepository<
	// diabolical typing :smug:
	T extends {
		[K in keyof ISoftDeletable]: ISoftDeletable[K] extends T[K] ? unknown : never;
	},
> extends IBaseRepository<T> {
	softDelete(id: string, deletedBy: string | null): Promise<T>;
}

export interface ISoftDeletable {
	deleted: boolean;
	deletedBy: string | null;
	deletedAt: Date | null;
}
