import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchController } from '@modules/search/controllers/search.controller';
import { SearchService } from '@modules/search/providers/search.service';
import { UserModule } from '@modules/user/user.module';
import { PostModule } from '@modules/post/post.module';
import { EventModule } from '@modules/event/event.module';
import { GroupModule } from '@modules/group/group.module';
import { ISearchRepository } from '@modules/search/repositories/search.repository';
import { SearchRepositoryImpl } from '@modules/search/repositories/search.repository.impl';
import { User, UserSchema } from '@modules/user/entities/user.schema';
import { Post, PostSchema } from '@modules/post/entities/post.schema';
import { Event, EventSchema } from '@modules/event/entities/event.schema';
import { Group, GroupSchema } from '@modules/group/entities/group.schema';
import { SearchHistory, SearchHistorySchema } from '@modules/search/entities/searchHistory.schema';
import { ISearchHistoryRepository } from '@modules/search/repositories/searchHistory.repository';
import { SearchHistoryRepositoryImpl } from '@modules/search/repositories/searchHistory.repository.impl';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: User.name, schema: UserSchema },
			{ name: Post.name, schema: PostSchema },
			{ name: Event.name, schema: EventSchema },
			{ name: Group.name, schema: GroupSchema },
			{ name: SearchHistory.name, schema: SearchHistorySchema },
		]),
		forwardRef(() => UserModule),
		forwardRef(() => PostModule),
		forwardRef(() => EventModule),
		forwardRef(() => GroupModule),
	],
	controllers: [SearchController],
	providers: [
		SearchService,
		{ provide: ISearchRepository, useClass: SearchRepositoryImpl },
		{ provide: ISearchHistoryRepository, useClass: SearchHistoryRepositoryImpl },
	],
	exports: [SearchService],
})
export class SearchModule {}
