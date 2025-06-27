import { EntityNotFound } from '@common/exceptions/EntityNotFound.error.js';
import { IBaseRepository } from './base-repository.type';
import { Model } from 'mongoose';
import { Class } from './class.type.js';

export class MongooseRepositoryImpl<T> implements IBaseRepository<T> {
	constructor(
		private readonly entityModel: Model<T>,
		private readonly entityClass: Class<T>,
	) {}

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
		const foundEntity = (await this.entityModel.findOne(where).exec())?.toObject();
		return foundEntity || null;
	}

	async delete(id: string): Promise<T | null> {
		const deletedEntity = (await this.entityModel.findByIdAndDelete(id).exec())?.toObject();
		return deletedEntity || null;
	}
	async find(where: Partial<T>): Promise<T[]> {
		const foundEntities = (await this.entityModel.find(where).exec()).map(e => e.toObject());
		return foundEntities;
	}
}
