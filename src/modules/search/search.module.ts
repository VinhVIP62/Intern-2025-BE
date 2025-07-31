import { Module } from '@nestjs/common';
import { SearchService } from './providers/search.service';
import { SearchController } from './controllers/search.controller';
import { ElasticModule } from '../elastic/elastic.module';
import { PostModule } from '@modules/post/post.module';
import { UserModule } from '@modules/user/user.module';
import { EventModule } from '@modules/event/event.module';
import { FriendModule } from '@modules/friend/friend.module';

@Module({
	imports: [ElasticModule, PostModule, UserModule, EventModule, FriendModule],
	providers: [SearchService],
	controllers: [SearchController],
	exports: [SearchService],
})
export class SearchModule {}
