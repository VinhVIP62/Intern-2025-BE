import { Module } from '@nestjs/common';
import { ElasticsearchModule as ESModule } from '@nestjs/elasticsearch';
import { SearchService } from './search.service';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';
import { esConfig } from '@configs/es.config';
import { SharedModule } from 'src/shared/shared.module';
import { SearchController } from './controller/search.controller';

@Module({
	imports: [
		ESModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: esConfig,
		}),
		SharedModule,
	],
	providers: [SearchService],
	exports: [ESModule, SearchService],
	controllers: [SearchController],
})
export class SearchModule {}
