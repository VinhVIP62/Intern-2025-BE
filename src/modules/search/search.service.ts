import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { IProfileRepository } from '@modules/user/repositories/profile.repository';
import { Profile } from '@modules/user/entities/profile.schema';
import { Post } from '@modules/post/entities/post.schema';
import { IPostRepository } from '@modules/post/repositories/post.repository';
import { PostMapper } from '@modules/post/mapper/post.mapper';
import { NotFoundException } from '@nestjs/common';
import { IEventRepository } from '@modules/event/repositories/event.repository';
import { IEventMemberRepository } from '@modules/event/repositories/eventmember.repository';
import { EventMapper } from '@modules/event/mapper/event.mapper';
import { Event } from '@modules/event/entities/event.schema';

@Injectable()
export class SearchService {
	constructor(
		private readonly esService: ElasticsearchService,
		private readonly profileRepository: IProfileRepository,
		private readonly postRepo: IPostRepository,
		private readonly postMapper: PostMapper,
		private readonly eventRepo: IEventRepository,
		private readonly eventMemberRepo: IEventMemberRepository,
		private readonly eventMapper: EventMapper,
	) {}

	async index<T = any>(index: string, id: string, data: T) {
		return await this.esService.index<T>({
			index,
			id,
			document: data,
		});
	}

	async search<T = any>(
		index: string,
		query: string,
		fields: string[] = ['title', 'content'],
	): Promise<T[]> {
		const result = await this.esService.search({
			index,
			query: {
				multi_match: {
					query,
					fields,
				},
			},
		});
		return result.hits.hits.map(hit => hit._source as T);
	}

	async searchProfile(keyword: string) {
		const profiles = await this.search<Profile>('profile', keyword, [
			'firstName^3',
			'lastName^2',
			'nickname',
			'address.province',
			'address.district',
			'sportInterests',
		]);
		return profiles;
	}

	async reindexProfiles(): Promise<number> {
		const allProfiles = await this.profileRepository.findAll();
		let successCount = 0;

		for (const profile of allProfiles) {
			await this.index('profile', profile.userId, {
				userId: profile.userId,
				firstName: profile.firstName,
				lastName: profile.lastName,
				nickName: profile.nickname,
				address: profile.address,
				avatarUrl: profile.avatarUrl,
				coverUrl: profile.coverUrl,
				sportInterests: profile.sportInterests,
			});
			successCount++;
		}

		return successCount;
	}

	async searchPost(keyword: string) {
		const postIds = await this.search<Post>('post', keyword, ['title^2', 'content']);

		const res = await Promise.all(
			postIds.map(async postId => {
				const post = await this.postRepo.findById(postId.id);
				if (!post) throw new NotFoundException('post.NOT_FOUND');
				return await this.postMapper.toResponse(post);
			}),
		);
		return res;
	}

	async reindexPosts(): Promise<number> {
		const posts = await this.postRepo.findAll();
		let successCount = 0;
		await Promise.all(
			posts.map(async post => {
				await this.index('post', post.id, {
					id: post.id,
					title: post.title,
					content: post.content,
				});
				successCount++;
			}),
		);
		return successCount;
	}

	async searchEvent(userId: string, keyword: string) {
		const eventIds = await this.search<Event>('event', keyword, [
			'ownerFirstName^4',
			'ownerLastName^3',
			'title^2',
			'content',
			'sportInterests',
		]);
		const res = await Promise.all(
			eventIds.map(async eventId => {
				const event = await this.eventRepo.getEventById(eventId.id);
				if (!event) throw new NotFoundException('event.NOT_FOUND');
				const invitaion = await this.eventMemberRepo.getByUserIdAndEventId(eventId.id, userId);
				return await this.eventMapper.toResponse(event, invitaion?.state);
			}),
		);
		return res;
	}
}
