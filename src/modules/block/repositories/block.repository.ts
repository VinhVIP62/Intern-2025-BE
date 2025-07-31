import { BlockDocument } from '../entities/block.schema';

export abstract class IBlockRepository {
	abstract findByUserAndBlocked(userId: string, blockedId: string): Promise<BlockDocument | null>;

	abstract addOrUpdateBlock(
		userId: string,
		blockedId: string,
		blockType: string,
	): Promise<BlockDocument>;

	abstract removeBlockType(
		userId: string,
		blockedId: string,
		blockType: string,
	): Promise<BlockDocument | null>;

	abstract getBlocksByUser(userId: string, type?: string): Promise<BlockDocument[]>;
}
