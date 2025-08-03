import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { IProfileRepository } from '@modules/user/repositories/interfaces/profile.repository';
import { Profile } from '@modules/user/entities/profile.schema';
import { Post } from '@modules/post/entities/post.schema';
import { IPostRepository } from '@modules/post/repositories/interfaces/post.repository';
import { PostMapper } from '@modules/post/mapper/post.mapper';
import { NotFoundException } from '@nestjs/common';
import { IEventRepository } from '@modules/event/repositories/event.repository';
import { IEventMemberRepository } from '@modules/event/repositories/eventmember.repository';
import { EventMapper } from '@modules/event/mapper/event.mapper';
import { Event } from '@modules/event/entities/event.schema';
import { PostState } from '@common/enum/post/post.state.enum';
import { EventState } from '@common/enum/event/event.state';

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

	async createIndexProfileWithVietnameseSupport() {
		await this.esService.indices.create({
			index: 'profile',
			body: {
				settings: {
					index: {
						max_ngram_diff: 8,
					},
					analysis: {
						analyzer: {
							vi_ngram_analyzer: {
								tokenizer: 'vi_ngram_tokenizer',
								filter: ['lowercase', 'asciifolding'],
							},
						},
						tokenizer: {
							vi_ngram_tokenizer: {
								type: 'ngram',
								min_gram: 1,
								max_gram: 9,
								token_chars: ['letter', 'digit'],
							},
						},
					},
				},
				mappings: {
					properties: {
						userId: { type: 'keyword' },
						firstName: {
							type: 'text',
							analyzer: 'vi_ngram_analyzer',
							search_analyzer: 'standard',
						},
						lastName: {
							type: 'text',
							analyzer: 'vi_ngram_analyzer',
							search_analyzer: 'standard',
						},
						nickName: {
							type: 'text',
							analyzer: 'vi_ngram_analyzer',
							search_analyzer: 'standard',
						},
						address: {
							type: 'object',
							properties: {
								province: {
									type: 'text',
									analyzer: 'vi_ngram_analyzer',
									search_analyzer: 'standard',
								},
								district: {
									type: 'text',
									analyzer: 'vi_ngram_analyzer',
									search_analyzer: 'standard',
								},
								country: {
									type: 'text',
									analyzer: 'vi_ngram_analyzer',
									search_analyzer: 'standard',
								},
								street: {
									type: 'text',
									analyzer: 'vi_ngram_analyzer',
									search_analyzer: 'standard',
								},
								ward: { type: 'text', analyzer: 'vi_ngram_analyzer', search_analyzer: 'standard' },
							},
						},
						sportInterests: { type: 'keyword' },
					},
				},
			} as Record<string, any>,
		});
	}

	async createIndexPostWithVietnameseSupport() {
		await this.esService.indices.create({
			index: 'post',
			body: {
				settings: {
					index: {
						max_ngram_diff: 8,
					},
					analysis: {
						analyzer: {
							vi_ngram_analyzer: {
								tokenizer: 'vi_ngram_tokenizer',
								filter: ['lowercase', 'asciifolding'],
							},
						},
						tokenizer: {
							vi_ngram_tokenizer: {
								type: 'ngram',
								min_gram: 1,
								max_gram: 9,
								token_chars: ['letter', 'digit'],
							},
						},
					},
				},
				mappings: {
					properties: {
						id: { type: 'keyword' },
						title: {
							type: 'text',
							analyzer: 'vi_ngram_analyzer',
							search_analyzer: 'standard',
						},
						content: {
							type: 'text',
							analyzer: 'vi_ngram_analyzer',
							search_analyzer: 'standard',
						},
						ownerFirstName: {
							type: 'text',
							analyzer: 'vi_ngram_analyzer',
							search_analyzer: 'standard',
						},
						ownerLastName: {
							type: 'text',
							analyzer: 'vi_ngram_analyzer',
							search_analyzer: 'standard',
						},
					},
				},
			} as Record<string, any>,
		});
	}

	async createIndexEventWithVietnameseSupport() {
		await this.esService.indices.create({
			index: 'event',
			body: {
				settings: {
					index: {
						max_ngram_diff: 8,
					},
					analysis: {
						analyzer: {
							vi_ngram_analyzer: {
								tokenizer: 'vi_ngram_tokenizer',
								filter: ['lowercase', 'asciifolding'],
							},
						},
						tokenizer: {
							vi_ngram_tokenizer: {
								type: 'ngram',
								min_gram: 1,
								max_gram: 9,
								token_chars: ['letter', 'digit'],
							},
						},
					},
				},
				mappings: {
					properties: {
						id: { type: 'keyword' },
						title: {
							type: 'text',
							analyzer: 'vi_ngram_analyzer',
							search_analyzer: 'standard',
						},
						content: {
							type: 'text',
							analyzer: 'vi_ngram_analyzer',
							search_analyzer: 'standard',
						},
						ownerFirstName: {
							type: 'text',
							analyzer: 'vi_ngram_analyzer',
							search_analyzer: 'standard',
						},
						ownerLastName: {
							type: 'text',
							analyzer: 'vi_ngram_analyzer',
							search_analyzer: 'standard',
						},
						sportInterests: { type: 'keyword' },
					},
				},
			} as Record<string, any>,
		});
	}

	async deleteIndex(index: string) {
		try {
			await this.esService.indices.delete({ index });
		} catch (e) {}
	}

	async search<T = any>(
		index: string,
		query: string,
		fields: string[] = ['title', 'content'],
		page: number = 1,
	): Promise<{ data: T[]; total: number; currentPage: number }> {
		const pageSize = 5;
		const from = (page - 1) * pageSize;
		const result = await this.esService.search({
			index,
			from,
			size: pageSize,
			query: {
				multi_match: {
					query,
					fields,
				},
			},
		});
		const data = result.hits.hits.map(hit => hit._source as T);
		const total = result.hits.total instanceof Object ? result.hits.total.value : result.hits.total;
		return {
			data,
			total: total ? total : 0,
			currentPage: page,
		};
	}

	async delete(index: string, id: string): Promise<void> {
		await this.esService.delete({
			index,
			id,
		});
	}

	async searchProfile(keyword: string, page: number = 1) {
		const profiles = await this.search<Profile>(
			'profile',
			keyword,
			[
				'firstName^3',
				'lastName^2',
				'nickname',
				'address.province',
				'address.district',
				'sportInterests',
			],
			page,
		);
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

	async searchPost(userId: string, keyword: string, page: number = 1) {
		const postIds = await this.search<Post>(
			'post',
			keyword,
			['ownerFirstName^4', 'ownerLastName^3', 'title^2', 'content'],
			page,
		);

		const res = await Promise.all(
			postIds.data.map(async postId => {
				const post = await this.postRepo.findById(postId.id);
				if (!post) throw new NotFoundException('post.NOT_FOUND');
				return await this.postMapper.toResponse(post, userId);
			}),
		);
		return {
			items: res,
			total: postIds.total,
			page: postIds.currentPage,
		};
	}

	async reindexPosts(): Promise<number> {
		const posts = await this.postRepo.findAll();
		let successCount = 0;
		await Promise.all(
			posts.map(async post => {
				if (!post) return;
				if (post.isDeleted || post.state === PostState.ONLY_ME || post.state === PostState.FRIEND)
					return;
				const ownerProfile = await this.profileRepository.findById(post.userId);
				await this.index('post', post.id, {
					id: post.id,
					ownerFirstName: ownerProfile.firstName,
					ownerLastName: ownerProfile.lastName,
					title: post.title,
					content: post.content,
				});
				successCount++;
			}),
		);
		return successCount;
	}

	async searchEvent(userId: string, keyword: string, page: number = 1) {
		const eventIds = await this.search<Event>(
			'event',
			keyword,
			['ownerFirstName^4', 'ownerLastName^3', 'title^2', 'content', 'sportInterests'],
			page,
		);
		const res = await Promise.all(
			eventIds.data.map(async eventId => {
				const event = await this.eventRepo.getEventById(eventId.id);
				if (!event) throw new NotFoundException('event.NOT_FOUND');
				const invitaion = await this.eventMemberRepo.getByUserIdAndEventId(eventId.id, userId);
				return await this.eventMapper.toResponse(event, invitaion?.state);
			}),
		);
		return {
			items: res,
			total: eventIds.total,
			page: eventIds.currentPage,
		};
	}

	async reindexEvents(): Promise<number> {
		const events = await this.eventRepo.findAll();
		let successCount = 0;
		await Promise.all(
			events.map(async event => {
				if (!event || event.isDeleted || event.state === EventState.PRIVATE) return;
				const ownerProfile = await this.profileRepository.findById(event.ownerId);
				if (!ownerProfile) return;
				await this.index('event', event.id, {
					id: event.id,
					title: event.title,
					content: event.content,
					ownerFirstName: ownerProfile.firstName,
					ownerLastName: ownerProfile.lastName,
					sportInterests: event.sportInterests,
				});
				successCount++;
			}),
		);
		return successCount;
	}

	async searchAll(userId: string, keyword: string) {
		const all = await this.esService.search({
			index: ['post', 'event', 'profile'],
			query: {
				multi_match: {
					query: keyword,
					fields: [
						'title^2',
						'content',
						'firstName',
						'lastName',
						'nickName',
						'description',
						'address.province',
						'address.district',
						'sportInterests',
					],
				},
			},
		});

		const res = Promise.all(
			all.hits.hits.map(async hit => {
				let data = hit._source;
				if (hit._index === 'post') {
					const postId = hit._source as { id: string };
					const post = await this.postRepo.findById(postId.id);
					if (!post) throw new NotFoundException('post.NOT_FOUND');
					data = await this.postMapper.toResponse(post, userId);
				} else if (hit._index === 'event') {
					const eventId = hit._source as { id: string };
					const event = await this.eventRepo.getEventById(eventId.id);
					if (!event) throw new NotFoundException('event.NOT_FOUND');
					const invitaion = await this.eventMemberRepo.getByUserIdAndEventId(eventId.id, userId);
					data = await this.eventMapper.toResponse(event, invitaion?.state);
				}
				return {
					index: hit._index,
					data: data,
				};
			}),
		);
		return res;
	}
}
