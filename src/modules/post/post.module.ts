import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NestjsFormDataModule } from 'nestjs-form-data';

import { CaslModule, FileHostModule } from '@shared/modules';

import { PostController } from './controllers';
import { SocialPost, SocialPostSchema } from './entities';
import { PostService } from './providers';
import { IPostRepositoryToken, PostRepositoryImpl } from './repositories';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: SocialPost.name,
				schema: SocialPostSchema,
			},
		]),
		NestjsFormDataModule,
		FileHostModule,
		CaslModule,
	],
	controllers: [PostController],
	providers: [
		PostService,
		{
			provide: IPostRepositoryToken,
			useClass: PostRepositoryImpl,
		},
	],
	exports: [PostService, IPostRepositoryToken],
})
export class PostModule {}
