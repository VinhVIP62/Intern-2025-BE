import { Model, PopulateOptions, SortOrder } from 'mongoose';

import { SORT } from '@common/enums';
import { EntityNotFound } from '@common/exceptions';
import { Class, LowerBound } from '@common/types/utils/';

import { IBaseEntity } from '../entities/base-entity.interface.js';
import { ISoftDeletableEntity } from '../entities/softdeletable-entity.interface.js';
import { WithPopulated } from '../entities/type-with-populated.type.js';
import {
	IBaseRepository,
	ISoftDeleteBaseRepository,
	QueryOptions,
	RepoOptions,
	SortOptions,
} from './base-repository.interface.js';

function buildPopulateObject(path: string): PopulateOptions {
	const segments = path.split('.');
	let obj: PopulateOptions = { path: segments.pop()! };

	// Build nested populate backwards
	while (segments.length) {
		const parent = segments.pop()!;
		obj = { path: parent, populate: obj };
	}

	return obj;
}

export class MongooseRepositoryImpl<T extends IBaseEntity> implements IBaseRepository<T> {
	constructor(
		protected readonly entityModel: Model<T>,
		protected readonly entityClass: Class<T>,
		repoOptions: RepoOptions<T> = {},
	) {
		// merge the merfed base and subclass with the user set Options
		// since this is the BASE class, field initializer came before constructor is called
		this.repoOptions = {};
		this.mergeRepoOptions(repoOptions);
	}

	repoOptions: RepoOptions<T>;

	protected mergeRepoOptions(repoOptions: RepoOptions<T>) {
		this.repoOptions = {
			filter: this.mergeFilter({ ...repoOptions.filter } as Partial<T>),
			populate: this.mergePopulate([...(repoOptions.populate ?? [])]),
			sort: this.mergeSort({ ...repoOptions.sort } as unknown as Record<keyof T, SORT>),
		};
	}

	/** To apply middleware transformation for all class methods */
	protected mergeFilter(filter: Partial<T> = {}) {
		const repoOptions: Partial<T> = this.repoOptions.filter ?? {};
		const merged = {
			...repoOptions,
			...filter,
		};
		return merged;
	}

	protected mergeSort(sort: SortOptions<T> = {}) {
		const repoOptions: SortOptions<T> = this.repoOptions.sort ?? {};
		const merged: SortOptions<T> = {};
		for (const key of Object.keys(sort)) {
			merged[key] = sort[key as keyof T];
		}
		for (const key of Object.keys(repoOptions)) {
			if (!(key in merged)) {
				merged[key] = repoOptions[key as keyof T];
			}
		}
		return merged;
	}

	protected mergePopulate(populate: string[] = []) {
		const repoOptions: string[] = this.repoOptions.populate ?? [];
		const merged: string[] = Array.from(new Set([...repoOptions, ...populate]));
		return merged;
	}

	protected transformFilter<TWhere>(
		this: MongooseRepositoryImpl<T>,
		where: { id?: string } & TWhere,
		queryOptions?: QueryOptions<T>,
	): { _id?: string } & Omit<TWhere, 'id'> {
		const repoOptions: Partial<T> =
			(
				queryOptions?.doNotUseRepoOptions === true ||
				(Array.isArray(queryOptions?.doNotUseRepoOptions) &&
					queryOptions?.doNotUseRepoOptions?.includes('filter'))
			) ?
				{}
			:	(this.repoOptions.filter ?? {});
		const queryRepoOptions = { ...repoOptions, ...(queryOptions?.customRepoOptions?.filter ?? {}) };
		// shallow copy cuz we have to delete key later
		const defaultFindOptions = { ...queryRepoOptions };

		// since the fields cannot be undefined
		// we can safely use undefined as an overwrite to find all regardless of the value of the field
		const cleanedFindOptions = { ...where };
		if (queryRepoOptions)
			for (const key of Object.keys(where)) {
				if (where[key] === undefined) {
					delete defaultFindOptions[key];
					delete cleanedFindOptions[key];
				}
			}

		const transformed = {
			...defaultFindOptions,
			...cleanedFindOptions,
			...(where.id && { _id: where.id }),
		};
		delete transformed.id;
		return transformed;
	}

	protected transformSort(
		queryOptions?: QueryOptions<T>,
	): { [key: string]: SortOrder } | undefined {
		const repoOptions: SortOptions<T> =
			(
				queryOptions?.doNotUseRepoOptions === true ||
				(Array.isArray(queryOptions?.doNotUseRepoOptions) &&
					queryOptions?.doNotUseRepoOptions?.includes('sort'))
			) ?
				{}
			:	(this.repoOptions.sort ?? {});
		const queryRepoOptions: SortOptions<T> = queryOptions?.customRepoOptions?.sort ?? {};
		const transformed: SortOptions<T> = {};
		for (const key of Object.keys(queryRepoOptions)) {
			transformed[key] = queryRepoOptions[key as keyof T];
		}
		for (const key of Object.keys(repoOptions)) {
			if (!(key in transformed)) {
				transformed[key] = repoOptions[key as keyof T];
			}
		}

		return transformed as { [key: string]: SortOrder } | undefined;
	}

	protected transformPopulate(queryOptions?: QueryOptions<T>): PopulateOptions[] {
		const repoOptions: string[] =
			(
				queryOptions?.doNotUseRepoOptions === true ||
				(Array.isArray(queryOptions?.doNotUseRepoOptions) &&
					queryOptions?.doNotUseRepoOptions?.includes('populate'))
			) ?
				[]
			:	(this.repoOptions.populate ?? []);
		const queryRepoOptions = queryOptions?.customRepoOptions?.populate ?? [];
		const merged: string[] = Array.from(new Set([...repoOptions, ...queryRepoOptions]));
		/** string transformation, appending  'Populated' postfix to values
		 * (.eg userId.deletedBy => userIdPopulated.deletedByPopulated)*/
		merged.forEach(
			(v, i) =>
				(merged[i] = v
					.split('.')
					.map(vsegment => vsegment + 'Populated')
					.join('.')),
		);
		const transformed: PopulateOptions[] = merged.map(p => buildPopulateObject(p));
		return transformed;
	}

	async create(data: Partial<T>, queryOptions?: QueryOptions<T>): Promise<T> {
		const createdEntity = await this.entityModel.create(data);
		const populatedEntity = await createdEntity.populate(this.transformPopulate(queryOptions));

		console.log(this.transformPopulate(queryOptions));
		return populatedEntity.toObject();
	}

	async update(id: string, data: Partial<T>, queryOptions?: QueryOptions<T>): Promise<T> {
		return this.findOneByAndUpdate({ id } as unknown as Partial<T>, data, queryOptions);
	}

	async delete(id: string, queryOptions?: QueryOptions<T>): Promise<T> {
		return this.findOneByAndDelete({ id } as unknown as Partial<T>, queryOptions);
	}

	async findOneById(id: string, queryOptions?: QueryOptions<T>): Promise<WithPopulated<T> | null> {
		const foundEntity = (
			await this.entityModel
				.findOne(this.transformFilter({ id }, queryOptions))
				.populate(this.transformPopulate(queryOptions))
				.exec()
		)?.toObject();
		return foundEntity || null;
	}

	async findOneByIdOrFail(id: string, queryOptions?: QueryOptions<T>): Promise<WithPopulated<T>> {
		const foundEntity = await this.findOneById(id, queryOptions);
		if (!foundEntity) throw new EntityNotFound(this.entityClass);
		return foundEntity;
	}

	async findOneBy(
		where: Partial<T>,
		queryOptions?: QueryOptions<T>,
	): Promise<WithPopulated<T> | null> {
		const foundEntity = (
			await this.entityModel
				.findOne(this.transformFilter(where, queryOptions))
				.populate(this.transformPopulate(queryOptions))
				.exec()
		)?.toObject();
		return foundEntity || null;
	}

	async findOneByOrFail(
		where: Partial<T>,
		queryOptions?: QueryOptions<T>,
	): Promise<WithPopulated<T>> {
		const foundEntity = await this.findOneBy(where, queryOptions);
		if (!foundEntity) throw new EntityNotFound(this.entityClass);
		return foundEntity;
	}

	async findOneByAndUpdate(
		where: Partial<T>,
		data: Partial<T>,
		queryOptions?: QueryOptions<T>,
	): Promise<WithPopulated<T>> {
		const updatedEntity = (
			await this.entityModel
				.findOneAndUpdate(this.transformFilter(where, queryOptions), data, {
					new: true,
					runValidators: true,
				})
				.populate(this.transformPopulate(queryOptions))
				.exec()
		)?.toObject();
		if (!updatedEntity) throw new EntityNotFound(this.entityClass);
		return updatedEntity;
	}

	async findOneByAndDelete(
		where: Partial<T>,
		queryOptions?: QueryOptions<T>,
	): Promise<WithPopulated<T>> {
		const deletedEntity = (
			await this.entityModel
				.findOneAndDelete(this.transformFilter(where, queryOptions))
				.populate(this.transformPopulate(queryOptions))
				.exec()
		)?.toObject();
		if (!deletedEntity) throw new EntityNotFound(this.entityClass);
		return deletedEntity;
	}

	async find(where: Partial<T>, queryOptions?: QueryOptions<T>): Promise<WithPopulated<T>[]> {
		const foundEntities = (
			await this.entityModel
				.find(this.transformFilter(where, queryOptions))
				.sort(this.transformSort(queryOptions))
				.skip(queryOptions?.skip || 0)
				.limit(queryOptions?.limit || 0)
				.populate(this.transformPopulate(queryOptions))
				.exec()
		).map(e => e.toObject());
		return foundEntities;
	}

	async count(where: Partial<T>, queryOptions?: QueryOptions<T>): Promise<number> {
		const count = this.entityModel.countDocuments(this.transformFilter(where, queryOptions));
		return count;
	}

	async exists(where: Partial<T>, queryOptions?: QueryOptions<T>): Promise<boolean> {
		const existing = await this.entityModel.exists(this.transformFilter(where, queryOptions));
		return existing ? true : false;
	}
}

/**
 * @see
 * T extending ISoftDeletable means it has a narrower typing so we can't just assign as is.
 * Unfortunately there's no options in TS to set the lowerbound so we have to introduce this workaround.
 * Well it warns us enough when using the class but warns us too much when defining the methods,
 * so feel free to use type assertion inside the methods.
 * */
export class MongooseSoftDeleteRepositoryImpl<
		T extends ISoftDeletableEntity & LowerBound<T, ISoftDeletableEntity>,
	>
	extends MongooseRepositoryImpl<T>
	implements ISoftDeleteBaseRepository<T>
{
	constructor(
		protected readonly entityModel: Model<T>,
		protected readonly entityClass: Class<T>,
		repoOptions: RepoOptions<T> = {},
	) {
		/**
		 * this is a sub class so the field initializers came after super is called,
		 * calling super here would just merge with the options in the baseclass.
		 *
		 * init base -> set repoOptions for THIS subclass -> merge
		 */
		super(entityModel, entityClass);
		this.repoOptions = {
			filter: { deleted: false } as Partial<T>,
			populate: ['deletedBy'],
		};
		this.mergeRepoOptions(repoOptions);
	}

	/** [PLA] not finished as this does not soft delete related entities */
	async softDelete(
		id: string,
		deletedBy: string | null = null,
		queryOptions?: QueryOptions<T>,
	): Promise<WithPopulated<T>> {
		// Still have to assert type, but dw we already have a check above
		return this.findOneByAndSoftDelete({ id } as unknown as Partial<T>, deletedBy, queryOptions);
	}

	/** [PLA] not finished as this does not soft delete related entities */
	async findOneByAndSoftDelete(
		where: Partial<T>,
		deletedBy: string | null = null,
		queryOptions?: QueryOptions<T>,
	): Promise<WithPopulated<T>> {
		const updatedData = {
			deleted: true,
			deletedBy,
			deletedAt: new Date(),
		} as Partial<T>;
		return this.findOneByAndUpdate(where, updatedData, queryOptions);
	}

	/** [PLA] not finished as this does not recover related entities */
	async restore(id: string, queryOptions?: QueryOptions<T>): Promise<T> {
		return this.update(
			id,
			{ deleted: false, deletedBy: null, deletedAt: null } as Partial<WithPopulated<T>>,
			{
				...queryOptions,
				doNotUseRepoOptions: ['filter'],
			},
		);
	}
}
