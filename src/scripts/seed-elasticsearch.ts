import { NestFactory } from '@nestjs/core';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Post } from '@modules/post/entities/post.schema';
import { User } from '@modules/user/entities/user.schema';
import { AppModule } from 'src/app.module';
import { ElasticIndexingService } from '@modules/elastic/elastic-indexing.service';

type PostWithAuthor = {
	_id: string;
	title: string;
	content: string;
	author: {
		_id: string;
		fullName: string;
	};
	hashtags: string[];
	sports: { _id: string; name: string }[];
};

type EventWithCreatorAndSports = {
	_id: string;
	title: string;
	description?: string;
	sports: { _id: string; name: string }[];
	creator: {
		_id: string;
		fullName: string;
	};
	hashtags: string[];
};

async function bootstrap() {
	const app = await NestFactory.createApplicationContext(AppModule);

	const postModel = app.get<Model<Post>>(getModelToken(Post.name));
	const userModel = app.get<Model<User>>(getModelToken(User.name));
	const elasticIndexingService = app.get(ElasticIndexingService);

	// --- Seed Posts ---
	const posts = await postModel
		.find()
		.populate('author', '_id fullName')
		.populate('sports')
		.lean<PostWithAuthor[]>();

	for (const post of posts) {
		await elasticIndexingService.indexPost({
			id: post._id.toString(),
			title: post.title,
			content: post.content,
			authorId: post.author._id.toString(),
			authorName: post.author?.fullName,
			hashtags: post.hashtags,
			sports: post.sports?.map(p => p.name) ?? [],
		});
	}

	console.log(`✅ Indexed ${posts.length} posts to Elasticsearch`);

	// --- Seed Events ---
	const eventModel = app.get<Model<Event>>(getModelToken(Event.name));

	const events = await eventModel
		.find()
		.populate('creator', '_id fullName')
		.populate('sports', '_id name') // populate sport names
		.lean<EventWithCreatorAndSports[]>();

	for (const event of events) {
		const sportNames = event.sports?.map(s => s.name) ?? [];

		await elasticIndexingService.indexEvent({
			id: event._id.toString(),
			creatorId: event.creator._id.toString(),
			creatorName: event.creator.fullName,
			title: event.title,
			description: event.description,
			sports: sportNames,
			hashtags: event.hashtags,
		});
	}

	console.log(`✅ Indexed ${events.length} events to Elasticsearch`);

	// --- Seed Users ---
	const users = await userModel.find().lean();

	for (const user of users) {
		await elasticIndexingService.indexUser({
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
