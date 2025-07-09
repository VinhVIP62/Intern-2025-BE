import { Module, Global } from '@nestjs/common';
import { ElasticService } from './elastic.service';
import { ElasticIndexingService } from './elastic-indexing.service';

@Global()
@Module({
	providers: [ElasticService, ElasticIndexingService],
	exports: [ElasticService, ElasticIndexingService],
})
export class ElasticModule {}
