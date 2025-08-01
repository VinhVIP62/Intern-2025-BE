import { PostModule, UserModule } from '@modules/index';
import { Module } from '@nestjs/common';
import { SearchService } from './providers/search.service';
import { SearchController } from './controller/search.controller';
import { GeminiModule } from '../../modules/gemini/gemini.module';
import { EventModule } from '@modules/event/event.module';
@Module({
	imports: [UserModule, PostModule, GeminiModule, EventModule],
	providers: [SearchService],
	controllers: [SearchController],
	exports: [SearchService],
})
export class SearchModule {}
