import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchController } from './controllers/search.controller';
import { SearchService } from './providers/search.service';
import { UserModule } from '../user/user.module';
import { PostModule } from '../post/post.module';
import { EventModule } from '../event/event.module';
import { ISearchRepository } from './repositories/search.repository';
import { SearchRepositoryImpl } from './repositories/search.repository.impl';
import { User, UserSchema } from '../user/entities/user.schema';
import { Post, PostSchema } from '../post/entities/post.schema';
import { Event, EventSchema } from '../event/entities/event.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: User.name, schema: UserSchema },
			{ name: Post.name, schema: PostSchema },
			{ name: Event.name, schema: EventSchema },
		]),
		forwardRef(() => UserModule),
		forwardRef(() => PostModule),
		forwardRef(() => EventModule),
	],
	controllers: [SearchController],
	providers: [SearchService, { provide: ISearchRepository, useClass: SearchRepositoryImpl }],
	exports: [SearchService],
})
export class SearchModule {}
