import { NestFactory } from '@nestjs/core';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Post } from '@modules/post/entities/post.schema';
import { User } from '@modules/user/entities/user.schema';
import { SearchService } from '@modules/search/providers/search.service';
import { AppModule } from 'src/app.module';

type PostWithAuthor = {
	_id: string;
	title: string;
	content: string;
	author: {
		_id: string;
		fullName: string;
	};
};

async function bootstrap() {
	const app = await NestFactory.createApplicationContext(AppModule);

	const postModel = app.get<Model<Post>>(getModelToken(Post.name));
	const userModel = app.get<Model<User>>(getModelToken(User.name));
	const searchService = app.get(SearchService);

	// --- Seed Posts ---
	const posts = await postModel.find().populate('author', '_id fullName').lean<PostWithAuthor[]>();

	for (const post of posts) {
		await searchService.indexPost({
			id: post._id.toString(),
			title: post.title,
			content: post.content,
			authorId: post.author._id.toString(),
			authorName: post.author?.fullName,
		});
	}

	console.log(`✅ Indexed ${posts.length} posts to Elasticsearch`);

	// --- Seed Users ---
	const users = await userModel.find().lean();

	for (const user of users) {
		await searchService.indexUser({
			id: user._id.toString(),
			fullName: user.fullName,
			// bio: user.bio || '',
		});
	}

	console.log(`✅ Indexed ${users.length} users to Elasticsearch`);

	await app.close();
	process.exit(0);
}

bootstrap().catch(err => {
	console.error('❌ Error seeding Elasticsearch:', err);
	process.exit(1);
});
