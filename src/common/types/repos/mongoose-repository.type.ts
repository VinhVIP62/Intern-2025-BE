import { Model } from 'mongoose';

import { EntityNotFound } from '@common/exceptions';

import { Class } from '../utils/class.type.js';
import { IBaseRepository, ISoftDeletable, ISoftDeleteBaseRepository } from './base-repository.type';

export class MongooseRepositoryImpl<T extends { id: string }> implements IBaseRepository<T> {
	constructor(
		protected readonly entityModel: Model<T>,
		protected readonly entityClass: Class<T>,
	) {}

	protected transformFindQueryId(where: Partial<T>): Partial<T> & { _id?: string } {
		const transformed = {
			...where,
			...(where.id && { _id: where.id }),
		};
		delete transformed.id;
		return transformed;
	}

	async create(data: Partial<T>): Promise<T> {
		return (await this.entityModel.insertOne(data, { validateBeforeSave: true })).toObject();
	}

	async update(id: string, data: Partial<T>): Promise<T> {
		const updatedEntity = (
			await this.entityModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec()
		)?.toObject();
		if (!updatedEntity) throw new EntityNotFound(this.entityClass);
		return updatedEntity;
	}

	async findOneById(id: string): Promise<T | null> {
		const foundEntity = (await this.entityModel.findById(id).exec())?.toObject();
		return foundEntity || null;
	}

	async findOneBy(where: Partial<T>): Promise<T | null> {
		const foundEntity = (
			await this.entityModel.findOne(this.transformFindQueryId(where)).exec()
		)?.toObject();
		return foundEntity || null;
	}

	async delete(id: string): Promise<T | null> {
		const deletedEntity = (await this.entityModel.findByIdAndDelete(id).exec())?.toObject();
		return deletedEntity || null;
	}

	async find(where: Partial<T>): Promise<T[]> {
		const foundEntities = (
			await this.entityModel.find(this.transformFindQueryId(where)).exec()
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
		T extends { id: string } & {
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
		super(entityModel, entityClass);
	}

	/** Slightly modified update method of `MongooseRepositoryImpl<T>`.
	 * Now also checks if `deleted` was set to `true`.
	 */
	async update(id: string, data: Partial<T>): Promise<T> {
		const updatedEntity = (
			await this.entityModel
				.findOneAndUpdate(this.transformFindQueryId({ id, deleted: false } as Partial<T>), data, {
					new: true,
					runValidators: true,
				})
				.exec()
		)?.toObject();
		if (!updatedEntity) throw new EntityNotFound(this.entityClass);
		return updatedEntity;
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
}
