import { Injectable } from '@nestjs/common';
import { UserService } from '@modules/user/providers/user.service';
import { PostService } from '@modules/post/providers/post.service';
import nlp from 'compromise';
import { GeminiService } from '@modules/gemini/gemini.service';
import { EventService } from '@modules/event/providers/event.service';

@Injectable()
export class SearchService {
	constructor(
		private readonly userService: UserService,
		private readonly postService: PostService,
		private readonly geminiService: GeminiService,
		private readonly eventService: EventService,
	) {}
	async searchEngine(query: string, type: string, userId: string) {
		// const classifiedQuery = await this.geminiService.classifyAndExtractQuery(query);
		// console.log('Classified query:', classifiedQuery);

		// let {
		// 	entityType,
		// 	usernames,
		// 	activities,
		// 	nouns,
		// 	locations,
		// 	others,
		// 	events,
		// 	posts,
		// 	filters,
		// 	originalQuery,
		// 	searchApiCall,
		// } = classifiedQuery;
		// const people = usernames.map(username => username.toLowerCase().trim().split(/\s+/)).flat();
		// const places = locations.map(location => location.toLowerCase().trim().split(/\s+/)).flat();
		// nouns = nouns.map(noun => noun.toLowerCase().trim().split(/\s+/)).flat();
		// activities = activities.map(activity => activity.toLowerCase().trim().split(/\s+/)).flat();
		// others = others.map(other => other.toLowerCase().trim().split(/\s+/)).flat();
		// events = events.map(event => event.toLowerCase().trim().split(/\s+/)).flat();
		// posts = posts.map(post => post.toLowerCase().trim().split(/\s+/)).flat();

		// const allWords = [
		// 	...people,
		// 	...places,
		// 	...nouns,
		// 	...activities,
		// 	...others,
		// 	...events,
		// 	...posts,
		// ].map(word => word.toLowerCase());
		// const usedWords = new Set(
		// 	[...people, ...places, ...activities, ...nouns].flat().map(word => word.toLowerCase()),
		// );

		// const unknown = allWords.filter(word => !usedWords.has(word.toLowerCase()));

		// console.log('Unknown words:', unknown);

		// // Create proper string patterns instead of RegExp objects
		// const personPattern = [...people, ...places, ...nouns, ...activities, ...unknown]
		// 	.flat()
		// 	.filter(term => term && term.trim() !== '');
		// const contentTerms = [...places, ...people, ...nouns, ...activities, ...unknown]
		// 	.flat()
		// 	.filter(term => term && term.trim() !== ''); // Remove empty/undefined values

		// const contentPattern = contentTerms.length > 0 ? contentTerms.join('|') : '';

		// const doc = nlp(query);

		// const people = doc.people().out('array') || [];
		// const places = doc.places().out('array') || [];
		// const allWords = doc.terms().out('array') || [];
		// const nouns = doc.nouns().out('array') || [];
		// const verbs = doc.verbs().out('array') || [];

		// console.log('🔍 Search Debug:');
		// console.log('Original query:', query);
		// console.log('People:', people);
		// console.log('Places:', places);
		// console.log('Verbs:', verbs);
		// console.log('Nouns:', nouns);
		// console.log('All words:', allWords);

		// const usedWords = new Set([...people, ...places].map(word => word.toLowerCase()));
		// const unknown = allWords.filter(word => !usedWords.has(word.toLowerCase()));

		// console.log('Unknown words:', unknown);

		// // Create proper string patterns instead of RegExp objects
		// const personPattern = [...people, ...places, ...nouns, ...verbs, ...unknown].filter(
		// 	term => term && term.trim() !== '',
		// );
		// const contentTerms = [...places, ...people, ...nouns, ...verbs, ...unknown].filter(
		// 	term => term && term.trim() !== '',
		// ); // Remove empty/undefined values

		// const contentPattern = contentTerms.length > 0 ? contentTerms.join('|') : '';

		// console.log('Person pattern:', personPattern);
		// console.log('Content pattern:', contentPattern);
		// if (type === 'post') {
		// 	const posts = await this.postService.searchPost(contentPattern, userId);
		// 	return { posts };
		// } else if (type === 'user') {
		// 	const users = await this.userService.searchUser(personPattern.join('|'), userId);
		// 	return { users };
		// }
		// const findPosts = await this.postService.searchPost(contentPattern, userId);
		// const findUsers = await this.userService.searchUser(personPattern.join('|'), userId);
		if (type === 'user') {
			const users = await this.userService.searchUser(query, userId);
			return { users };
		} else if (type === 'post') {
			const posts = await this.postService.searchPost(query, userId);
			return { posts };
		} else if (type === 'event') {
			const events = await this.eventService.searchEvent(query, userId);
			return { events };
		}
		const users = await this.userService.searchUser(query, userId);
		const posts = await this.postService.searchPost(query, userId);
		const events = await this.eventService.searchEvent(query, userId);
		return { users, posts, events };
	}
}
