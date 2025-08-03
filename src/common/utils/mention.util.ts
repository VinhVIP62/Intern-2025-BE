export class MentionHelper {
	static extractUserIdsFromContent(content: string): string[] {
		if (!content) return [];
		const regex = /@([a-zA-Z0-9-_]+)/g;
		const result = new Set<string>();
		let match;

		while ((match = regex.exec(content)) !== null) {
			result.add(match[1]);
		}

		return [...result];
	}
}
