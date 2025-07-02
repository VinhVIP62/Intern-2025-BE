import { ISoftDeletable } from '../entities';

export type repoOptions<T> = {
	defaultFindOptions?: Partial<T>;
};

export type queryOptions<T> = {
	/** Whether to skip the default repoOptions
	 * Default value is false | undefined
	 */
	doNotUseRepoOptions?: boolean;
	/** Set your own option for this query only */
	customRepoOptions?: Partial<repoOptions<T>>;
};

export interface IBaseRepository<T extends object> {
	readonly repoOptions: repoOptions<T>;
	create(data: Partial<T>, queryOptions?: queryOptions<T>): Promise<T>;
	update(id: string, data: Partial<T>, queryOptions?: queryOptions<T>): Promise<T>;
	delete(id: string, queryOptions?: queryOptions<T>): Promise<T>;
	findOneById(id: string, queryOptions?: queryOptions<T>): Promise<T | null>;
	findOneBy(where: Partial<T>, queryOptions?: queryOptions<T>): Promise<T | null>;
	findOneByAndUpdate(
		where: Partial<T>,
		data: Partial<T>,
		queryOptions?: queryOptions<T>,
	): Promise<T | null>;
	findOneByAndDelete(where: Partial<T>, queryOptions?: queryOptions<T>): Promise<T | null>;
	find(where: Partial<T>, queryOptions?: queryOptions<T>): Promise<T[]>;
}

export interface ISoftDeleteBaseRepository<
	// diabolical typing :smug:
	// basically whatever type of the fields of ISoftDeletable will need to be exact
	// eg. deleted is boolean, not true, nor boolean | null
	T extends {
		[K in keyof ISoftDeletable]: ISoftDeletable[K] extends T[K] ? unknown : never;
	},
> extends IBaseRepository<T> {
	softDelete(id: string, deletedBy: string | null, queryOptions?: queryOptions<T>): Promise<T>;
	restore(id: string, queryOptions?: queryOptions<T>): Promise<T>;
}
