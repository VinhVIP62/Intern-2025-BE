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
		return this.entityModel.insertOne(data);
	}

	async update(id: string, data: Partial<T>): Promise<T> {
		const updatedEntity = await this.entityModel.findByIdAndUpdate(id, data, { new: true });
		if (updatedEntity === null) throw new EntityNotFound(this.entityClass);
		return updatedEntity;
	}

	async findOneById(id: string): Promise<T | null> {
		return await this.entityModel.findById(id);
	}

	async findOneBy(where: Partial<T>): Promise<T | null> {
		return await this.entityModel.findOne(where);
	}

	async delete(id: string): Promise<T | null> {
		return await this.entityModel.findByIdAndDelete(id);
	}
	async find(where: Partial<T>): Promise<T[]> {
		return await this.entityModel.find(where);
	}
}
