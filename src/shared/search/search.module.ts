import { PostModule, UserModule } from '@modules/index';
import { Module } from '@nestjs/common';
import { SearchService } from './providers/search.service';
import { SearchController } from './controller/search.controller';

@Module({
	imports: [UserModule, PostModule],
	providers: [SearchService],
	controllers: [SearchController],
	exports: [SearchService],
})
export class SearchModule {}
