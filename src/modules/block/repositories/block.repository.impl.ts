import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Block, BlockDocument } from '../entities/block.schema';
import { IBlockRepository } from './block.repository';

@Injectable()
export class BlockRepositoryImpl implements IBlockRepository {
	constructor(@InjectModel(Block.name) private readonly model: Model<BlockDocument>) {}

	async findByUserAndBlocked(userId: string, blockedId: string) {
		return this.model.findOne({ user: userId, blocked: blockedId }).exec();
	}

	async addOrUpdateBlock(userId: string, blockedId: string, blockType: string) {
		return this.model
			.findOneAndUpdate(
				{ user: userId, blocked: blockedId },
				{ $addToSet: { blockTypes: blockType } },
				{ upsert: true, new: true },
			)
			.exec();
	}

	async removeBlockType(userId: string, blockedId: string, blockType: string) {
		const updated = await this.model
			.findOneAndUpdate(
				{ user: userId, blocked: blockedId },
				{ $pull: { blockTypes: blockType } },
				{ new: true },
			)
			.exec();

		if (updated && updated.blockTypes.length === 0) {
			await this.model.deleteOne({ _id: updated._id }).exec();
			return null;
		}

		return updated;
	}

	async getBlocksByUser(userId: string, type?: string): Promise<BlockDocument[]> {
		const query: Record<string, any> = { user: userId };
		if (type) query.blockTypes = type;
		const blocks = await this.model
			.find(query)
			.populate('blocked', '_id fullName avatarUrl')
			.lean()
			.exec();
		return blocks;
	}
}
