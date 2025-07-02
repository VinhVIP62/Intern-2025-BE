import { Model } from 'mongoose';

import { EntityNotFound } from '@common/exceptions';

import { Class } from '../utils/class.type.js';
import {
	IBaseRepository,
	ISoftDeletable,
	ISoftDeleteBaseRepository,
	queryOptions,
	repoOptions,
} from './base-repository.type';

export class MongooseRepositoryImpl<T extends object> implements IBaseRepository<T> {
	constructor(
		protected readonly entityModel: Model<T>,
		protected readonly entityClass: Class<T>,
		readonly repoOptions: repoOptions<T> = {},
	) {}

	/** To apply middleware transformation for all class methods */
	protected transformQuery<TWhere>(
		where: { id?: string } & TWhere,
		queryOptions?: queryOptions<T>,
	): { _id?: string } & Omit<TWhere, 'id'> {
		const repoOptions = !queryOptions?.doNotUseRepoOptions ? this.repoOptions : {};
		const queryRepoOptions = { ...repoOptions, ...queryOptions?.customRepoOptions };
		// shallow copy cuz we have to delete key later
		const defaultFindOptions = { ...queryRepoOptions.defaultFindOptions };

		// since the fields cannot be undefined
		// we can safely use undefined as an overwrite to find all regardless of the value of the field
		const cleanedFindOptions = { ...where };
		if (queryRepoOptions.defaultFindOptions)
			for (const key of Object.keys(where)) {
				if (where[key] === undefined) {
					delete defaultFindOptions[key];
					delete cleanedFindOptions[key];
				}
			}

		const transformed = {
			...cleanedFindOptions,
			...defaultFindOptions,
			...(where.id && { _id: where.id }),
		};
		delete transformed.id;
		return transformed;
	}

	async create(data: Partial<T>): Promise<T> {
		return (await this.entityModel.insertOne(data, { validateBeforeSave: true })).toObject();
	}

	async update(id: string, data: Partial<T>, queryOptions?: queryOptions<T>): Promise<T> {
		return this.findOneByAndUpdate({ id } as unknown as Partial<T>, data, queryOptions);
	}

	async delete(id: string, queryOptions?: queryOptions<T>): Promise<T> {
		return this.findOneByAndDelete({ id } as unknown as Partial<T>, queryOptions);
	}

	async findOneById(id: string, queryOptions?: queryOptions<T>): Promise<T | null> {
		const foundEntity = (
			await this.entityModel.findOne(this.transformQuery({ id }, queryOptions)).exec()
		)?.toObject();
		return foundEntity || null;
	}

	async findOneBy(where: Partial<T>, queryOptions?: queryOptions<T>): Promise<T | null> {
		const foundEntity = (
			await this.entityModel.findOne(this.transformQuery(where, queryOptions)).exec()
		)?.toObject();
		return foundEntity || null;
	}

	async findOneByAndUpdate(
		where: Partial<T>,
		data: Partial<T>,
		queryOptions?: queryOptions<T>,
	): Promise<T> {
		const updatedEntity = (
			await this.entityModel
				.findOneAndUpdate(this.transformQuery(where, queryOptions), data, {
					new: true,
					runValidators: true,
				})
				.exec()
		)?.toObject();
		if (!updatedEntity) throw new EntityNotFound(this.entityClass);
		return updatedEntity;
	}

	async findOneByAndDelete(where: Partial<T>, queryOptions?: queryOptions<T>): Promise<T> {
		const deletedEntity = (
			await this.entityModel.findOneAndDelete(this.transformQuery(where, queryOptions)).exec()
		)?.toObject();
		if (!deletedEntity) throw new EntityNotFound(this.entityClass);
		return deletedEntity;
	}

	async find(where: Partial<T>, queryOptions?: queryOptions<T>): Promise<T[]> {
		const foundEntities = (
			await this.entityModel.find(this.transformQuery(where, queryOptions)).exec()
		).map(e => e.toObject());
		return foundEntities;
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
		T extends {
			[K in keyof ISoftDeletable]: ISoftDeletable[K] extends T[K] ? unknown : never;
		},
	>
	extends MongooseRepositoryImpl<T>
	implements ISoftDeleteBaseRepository<T>
{
	constructor(
		protected readonly entityModel: Model<T>,
		protected readonly entityClass: Class<T>,
	) {
		super(entityModel, entityClass, { defaultFindOptions: { deleted: false } as Partial<T> });
	}

	async softDelete(id: string, deletedBy: string | null = null): Promise<T> {
		// Still have to assert type, but dw we already have a check above
		const updatedData = {
			deleted: true,
			deletedBy,
			deletedAt: new Date(),
		} as Partial<T>;
		return this.update(id, updatedData);
	}

	async restore(id: string): Promise<T> {
		return this.update(id, { deleted: false, deletedBy: null, deletedAt: null } as Partial<T>, {
			doNotUseRepoOptions: true,
		});
	}
}
