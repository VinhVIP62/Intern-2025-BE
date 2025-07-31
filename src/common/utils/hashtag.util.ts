export function extractHashtags(text: string): string[] {
	const matches = text.match(/#[\wÀ-ỹ\d_]+/g); // hỗ trợ cả dấu tiếng Việt
	return matches ? [...new Set(matches.map(tag => tag.toLowerCase()))] : [];
}
