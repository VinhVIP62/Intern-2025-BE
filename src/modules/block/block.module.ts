import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Block, BlockSchema } from './entities/block.schema';
import { IBlockRepository } from './repositories/block.repository';
import { BlockRepositoryImpl } from './repositories/block.repository.impl';
import { BlockService } from './providers/block.service';
import { BlockedUserController } from './controllers/block.controller';

@Module({
	imports: [MongooseModule.forFeature([{ name: Block.name, schema: BlockSchema }])],
	controllers: [BlockedUserController],
	providers: [
		BlockService,
		{
			provide: IBlockRepository,
			useClass: BlockRepositoryImpl,
		},
	],
	exports: [BlockService],
})
export class BlockModule {}
