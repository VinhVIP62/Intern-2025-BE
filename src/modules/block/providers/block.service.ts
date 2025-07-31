import { Injectable, NotFoundException } from '@nestjs/common';
import { IBlockRepository } from '../repositories/block.repository';
import { CreateBlockDto } from '../dto/create-block.dto';
import { plainToInstance } from 'class-transformer';
import { ResponseBlockDto } from '../dto/response-block.dto';

@Injectable()
export class BlockService {
	constructor(private readonly blockRepository: IBlockRepository) {}

	async blockUser(userId: string, dto: CreateBlockDto): Promise<ResponseBlockDto> {
		const updated = await this.blockRepository.addOrUpdateBlock(
			userId,
			dto.blockedUserId,
			dto.blockType,
		);

		return plainToInstance(ResponseBlockDto, updated, {
			excludeExtraneousValues: true,
		});
	}

	async unblockUser(userId: string, blockedUserId: string, blockType: string): Promise<void> {
		const existing = await this.blockRepository.findByUserAndBlocked(userId, blockedUserId);
		if (!existing) {
			throw new NotFoundException('Blocked user not found');
		}

		await this.blockRepository.removeBlockType(userId, blockedUserId, blockType);
	}

	async isBlocked(userId: string, otherUserId: string, type?: string): Promise<boolean> {
		const result = await this.blockRepository.findByUserAndBlocked(userId, otherUserId);

		if (!result) return false;
		if (type) return result.blockTypes.includes(type);
		return result.blockTypes.length > 0;
	}

	async getBlockedUsers(userId: string, type?: string): Promise<ResponseBlockDto[]> {
		const blocks = await this.blockRepository.getBlocksByUser(userId, type);

		// Nếu bạn muốn trả thêm thông tin user thì cần gọi UserService hoặc populate
		return blocks.map(block =>
			plainToInstance(ResponseBlockDto, block, {
				excludeExtraneousValues: true,
			}),
		);
	}
}
