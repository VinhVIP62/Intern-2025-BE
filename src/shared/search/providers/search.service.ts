import { Injectable } from '@nestjs/common';
import { UserService } from '@modules/user/providers/user.service';
import { PostService } from '@modules/post/providers/post.service';
import nlp from 'compromise';

@Injectable()
export class SearchService {
	constructor(
		private readonly userService: UserService,
		private readonly postService: PostService,
	) {}
	async searchEngine(query: string, type: string) {
		const doc = nlp(query);

		const people = doc.people().out('array') || [];
		const places = doc.places().out('array') || [];
		const allWords = doc.terms().out('array') || [];
		const nouns = doc.nouns().out('array') || [];
		const verbs = doc.verbs().out('array') || [];

		console.log('🔍 Search Debug:');
		console.log('Original query:', query);
		console.log('People:', people);
		console.log('Places:', places);
		console.log('Verbs:', verbs);
		console.log('Nouns:', nouns);
		console.log('All words:', allWords);

		const usedWords = new Set([...people, ...places].map(word => word.toLowerCase()));
		const unknown = allWords.filter(word => !usedWords.has(word.toLowerCase()));

		console.log('Unknown words:', unknown);

		// Create proper string patterns instead of RegExp objects
		const personPattern = [...places, ...people, ...nouns, ...verbs, ...unknown].filter(
			term => term && term.trim() !== '',
		);
		const contentTerms = [...places, ...people, ...nouns, ...verbs, ...unknown].filter(
			term => term && term.trim() !== '',
		); // Remove empty/undefined values

		const contentPattern = contentTerms.length > 0 ? contentTerms.join('|') : '';

		console.log('Person pattern:', personPattern);
		console.log('Content pattern:', contentPattern);
		if (type === 'post') {
			const posts = await this.postService.searchPost(contentPattern);
			return { posts };
		} else if (type === 'user') {
			const users = await this.userService.searchUser(personPattern.join('|'));
			return { users };
		}
		const posts = await this.postService.searchPost(contentPattern);
		const users = await this.userService.searchUser(personPattern.join('|'));
		console.log('Users found:', users.length);
		console.log('Posts found:', posts.length);
		return { users, posts };
	}
}
