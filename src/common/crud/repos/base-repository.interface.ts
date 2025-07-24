import { SORT } from '@common/enums';
import { LowerBound } from '@common/types/utils';

import { IBaseEntity, ISoftDeletableEntity, QuerriableType, WithPopulated } from '../entities';

export type SortOptions<T> = Partial<Record<keyof WithPopulated<T>, SORT>>;

/** will be appended to each repo methods */
export type RepoOptions<T> = {
	filter?: QuerriableType<T>;
	/** Array of path, if you don't want the path transformed to fit the type WithPopulated, add an underscore after the path. (eg. `PathName_`) */
	populate?: string[];
	sort?: SortOptions<T>;
};

export type QueryOptions<T> = {
	/** Whether to skip the default repoOptions
	 * Default value is false | undefined
	 */
	doNotUseRepoOptions?: boolean | (keyof RepoOptions<T>)[];
	/** Set your own options for this query only */
	customRepoOptions?: Partial<RepoOptions<T>>;
	limit?: number;
	skip?: number;
};

export interface IBaseRepository<T extends IBaseEntity> {
	repoOptions: RepoOptions<T>;
	create(data: Partial<T>, queryOptions?: QueryOptions<T>): Promise<WithPopulated<T>>;
	upsert(
		where: QuerriableType<T>,
		data: Partial<T>,
		queryOptions?: QueryOptions<T>,
	): Promise<WithPopulated<T>>;
	update(id: string, data: Partial<T>, queryOptions?: QueryOptions<T>): Promise<WithPopulated<T>>;
	delete(id: string, queryOptions?: QueryOptions<T>): Promise<WithPopulated<T>>;
	findOneBy(
		where: QuerriableType<T>,
		queryOptions?: QueryOptions<T>,
	): Promise<WithPopulated<T> | null>;
	findOneByOrFail(
		where: QuerriableType<T>,
		queryOptions?: QueryOptions<T>,
	): Promise<WithPopulated<T>>;
	findOneById(id: string, queryOptions?: QueryOptions<T>): Promise<WithPopulated<T> | null>;
	findOneByIdOrFail(id: string, queryOptions?: QueryOptions<T>): Promise<WithPopulated<T>>;
	find(where: QuerriableType<T>, queryOptions?: QueryOptions<T>): Promise<WithPopulated<T>[]>;
	findOneByAndUpdate(
		where: QuerriableType<T>,
		data: Partial<T>,
		queryOptions?: QueryOptions<T>,
	): Promise<WithPopulated<T>>;
	findOneByAndDelete(
		where: QuerriableType<T>,
		queryOptions?: QueryOptions<T>,
	): Promise<WithPopulated<T>>;
	count(where: QuerriableType<T>, queryOptions?: QueryOptions<T>): Promise<number>;
	exists(where: QuerriableType<T>, queryOptions?: QueryOptions<T>): Promise<boolean>;
}

export interface ISoftDeleteBaseRepository<
	// diabolical typing :smug:
	// basically whatever type of the fields of ISoftDeletable will need to be exact
	// eg. deleted is boolean, not true, nor boolean | null
	T extends ISoftDeletableEntity & LowerBound<T, ISoftDeletableEntity>,
> extends IBaseRepository<T> {
	softDelete(
		id: string,
		deletedBy: string | null,
		queryOptions?: QueryOptions<T>,
	): Promise<WithPopulated<T>>;
	findOneByAndSoftDelete(
		where: QuerriableType<T>,
		deletedBy: string | null,
		queryOptions?: QueryOptions<T>,
	): Promise<WithPopulated<T>>;
	restore(id: string, queryOptions?: QueryOptions<T>): Promise<WithPopulated<T>>;
}
